"""
API Keys Router
================
Manage user API keys and usage statistics.
"""

from fastapi import APIRouter, Depends, HTTPException, Body
from typing import List, Dict, Any
import secrets
import hashlib
import re
from datetime import datetime, timedelta

from app.utils.auth import get_current_user
from app.utils.encryption import encrypt_key, decrypt_key
from app.services.supabase_service import get_supabase

router = APIRouter()


@router.post("/keys/generate")
async def generate_api_key(
    user_id: str = Depends(get_current_user),
    payload: dict = Body(default={})
):
    raw_key = "xvt_" + secrets.token_urlsafe(32)
    key_hash = hashlib.sha256(raw_key.encode()).hexdigest()
    key_prefix = raw_key[:12]
    key_name = payload.get("name", "New Key")
    key_encrypted = encrypt_key(raw_key)

    supabase = get_supabase()
    result = supabase.table("api_keys").insert({
        "user_id": user_id,
        "key_hash": key_hash,
        "key_prefix": key_prefix,
        "key_encrypted": key_encrypted,
        "name": key_name,
        "is_active": True,
    }).execute()

    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to create API key")

    new_row = result.data[0]
    return {
        "key": raw_key,
        "id": new_row["id"],
        "name": new_row["name"],
        "prefix": new_row["key_prefix"],
    }


@router.get("/keys/list")
async def list_api_keys(user_id: str = Depends(get_current_user)):
    supabase = get_supabase()
    result = supabase.table("api_keys").select(
        "id, key_prefix, name, is_active, created_at, last_used_at"
    ).eq("user_id", user_id).eq("is_active", True).order("created_at", desc=True).execute()

    return {"keys": result.data or []}


@router.get("/keys/usage")
async def get_api_usage(user_id: str = Depends(get_current_user)):
    supabase = get_supabase()

    thirty_days_ago = (datetime.utcnow() - timedelta(days=30)).isoformat()

    result = supabase.table("api_usage").select("*").eq(
        "user_id", user_id
    ).gte("called_at", thirty_days_ago).order("called_at", desc=True).execute()

    rows = result.data or []
    total_calls = len(rows)
    by_tool = {}
    by_date_map = {}

    for row in rows:
        tool = row.get("tool_id") or "unknown"
        by_tool[tool] = by_tool.get(tool, 0) + 1
        date_str = row.get("called_at", "")[:10]
        if date_str:
            by_date_map[date_str] = by_date_map.get(date_str, 0) + 1

    by_date = []
    for i in range(29, -1, -1):
        dt = (datetime.utcnow() - timedelta(days=i)).strftime("%Y-%m-%d")
        dt_obj = datetime.strptime(dt, "%Y-%m-%d")
        short_date = dt_obj.strftime("%b %d").replace(" 0", " ")
        by_date.append({"date": short_date, "count": by_date_map.get(dt, 0)})

    return {
        "total_calls": total_calls,
        "by_tool": by_tool,
        "by_date": by_date,
        "recent": rows[:20]
    }


# ── UUID guard — must come before the handler body runs ──────────────────────
UUID_RE = re.compile(
    r'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
)

@router.get("/keys/{key_id}")
async def get_api_key(
    key_id: str,
    user_id: str = Depends(get_current_user)
):
    # Reject anything that isn't a valid UUID — prevents word slugs like
    # "usage" or "list" from ever reaching the Supabase query.
    if not UUID_RE.match(key_id):
        raise HTTPException(status_code=404, detail="Not found")

    supabase = get_supabase()
    result = supabase.table("api_keys").select(
        "id, key_prefix, key_encrypted, name, is_active, created_at, last_used_at"
    ).eq("id", key_id).eq("user_id", user_id).eq("is_active", True).execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="API key not found")

    row = result.data[0]

    if not row.get("key_encrypted"):
        raise HTTPException(
            status_code=409,
            detail="This key was created before encrypted storage was enabled. "
                   "Please delete it and generate a new one."
        )

    decrypted = decrypt_key(row["key_encrypted"])

    return {
        "id": row["id"],
        "name": row["name"],
        "prefix": row["key_prefix"],
        "key": decrypted,
        "created_at": row["created_at"],
        "last_used_at": row["last_used_at"],
    }


@router.patch("/keys/{key_id}/rename")
async def rename_api_key(
    key_id: str,
    user_id: str = Depends(get_current_user),
    payload: dict = Body(default={})
):
    if not UUID_RE.match(key_id):
        raise HTTPException(status_code=404, detail="Not found")

    new_name = payload.get("name", "").strip()
    if not new_name:
        raise HTTPException(status_code=422, detail="Name cannot be empty")

    supabase = get_supabase()

    existing = supabase.table("api_keys").select("id").eq(
        "id", key_id
    ).eq("user_id", user_id).eq("is_active", True).execute()

    if not existing.data:
        raise HTTPException(status_code=404, detail="API key not found")

    supabase.table("api_keys").update({"name": new_name}).eq("id", key_id).execute()

    return {"id": key_id, "name": new_name}

@router.delete("/keys/{key_id}/revoke")
async def revoke_api_key(key_id: str, user_id: str = Depends(get_current_user)):
    """Revoke an API key by setting is_active=false."""
    supabase = get_supabase()
    result = supabase.table("api_keys").update({"is_active": False}).eq("id", key_id).eq("user_id", user_id).execute()
    
    if not result.data:
        raise HTTPException(status_code=404, detail="Key not found")
        
    return {"success": True}