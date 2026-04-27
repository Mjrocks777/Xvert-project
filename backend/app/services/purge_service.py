# app/services/purge_service.py

import logging
import asyncio
from datetime import datetime, timezone, timedelta
from app.services.supabase_service import get_supabase

logger = logging.getLogger(__name__)

PURGE_AFTER_MINUTES = 30
PURGE_INTERVAL_SECONDS = 300  # check every 5 minutes


# ─────────────────────────────────────────
#  STORAGE FILE DELETION
# ─────────────────────────────────────────

def _delete_storage_file(file_url: str) -> bool:
    """
    Delete a file from Supabase Storage using its stored URL/path.

    Your storage_service.py stores paths in one of these formats:
      Format A (full URL):  https://xxx.supabase.co/storage/v1/object/public/bucket/user/file
      Format B (path only): user_id/conversion_id/filename

    This function handles both.
    """
    if not file_url:
        return True  # nothing to delete

    try:
        supabase = get_supabase()

        # ── Handle full Supabase public URL ──────────────────────
        if file_url.startswith("http"):
            # Extract everything after /object/public/
            marker = "/object/public/"
            if marker not in file_url:
                # Try signed URL format /object/sign/
                marker = "/object/sign/"
            if marker not in file_url:
                logger.warning(f"Unrecognised URL format: {file_url}")
                return False

            after_marker = file_url.split(marker)[1]
            # First segment is the bucket name
            parts = after_marker.split("/", 1)
            if len(parts) != 2:
                return False
            bucket, path = parts[0], parts[1]

        # ── Handle raw path (bucket/rest/of/path) ────────────────
        else:
            parts = file_url.split("/", 1)
            if len(parts) != 2:
                return False
            bucket, path = parts[0], parts[1]

        supabase.storage.from_(bucket).remove([path])
        logger.info(f"Deleted storage file: bucket={bucket} path={path}")
        return True

    except Exception as e:
        logger.error(f"Storage delete failed for {file_url}: {e}")
        return False


# ─────────────────────────────────────────
#  CORE PURGE JOB
# ─────────────────────────────────────────

def purge_expired_files() -> dict:
    """
    Finds conversions older than 30 minutes, deletes their
    Supabase Storage files, and updates the DB record.

    Uses your EXACT column names from the conversions table.
    """
    supabase = get_supabase()
    cutoff = datetime.now(timezone.utc) - timedelta(minutes=PURGE_AFTER_MINUTES)

    # ── Fetch expired unpurged records ───────────────────────────
    # Uses your exact column names: created_at, purged,
    # original_file_url, converted_file_url, status, id
    result = (
        supabase.table("conversions")
        .select("id, original_file_url, converted_file_url, status")
        .eq("purged", False)
        .lt("created_at", cutoff.isoformat())
        .neq("status", "pending")  # don't purge still-processing files
        .execute()
    )

    if not result.data:
        logger.debug("Purge run: no expired files found")
        return {"checked": 0, "purged": 0, "errors": 0}

    purged_count = 0
    error_count = 0

    for record in result.data:
        record_id = record["id"]
        all_deleted = True

        # ── Delete original file ──────────────────────────────────
        if record.get("original_file_url"):
            if not _delete_storage_file(record["original_file_url"]):
                all_deleted = False
                error_count += 1

        # ── Delete converted file ─────────────────────────────────
        if record.get("converted_file_url"):
            if not _delete_storage_file(record["converted_file_url"]):
                all_deleted = False
                error_count += 1

        # ── Update DB record ──────────────────────────────────────
        # Always mark purged=true even if storage delete partially
        # failed — prevents infinite retry loops on already-gone files
        try:
            supabase.table("conversions").update({
                "purged": True,
                "purged_at": datetime.now(timezone.utc).isoformat(),
                "status": "purged",          # uses your existing status column
                "original_file_url": None,   # clear URLs — files no longer exist
                "converted_file_url": None,
            }).eq("id", record_id).execute()

            purged_count += 1
            logger.info(
                f"Purged record {record_id} | "
                f"storage_clean={all_deleted}"
            )
        except Exception as e:
            logger.error(f"DB update failed for {record_id}: {e}")
            error_count += 1

    summary = {
        "checked": len(result.data),
        "purged": purged_count,
        "errors": error_count
    }
    logger.info(f"Purge run complete: {summary}")
    return summary


# ─────────────────────────────────────────
#  SCHEDULER
# ─────────────────────────────────────────

async def start_purge_scheduler():
    """
    Runs purge job every 5 minutes as a background async task.
    Started once via FastAPI lifespan in main.py.
    """
    logger.info(
        f"Purge scheduler started | "
        f"purge_after={PURGE_AFTER_MINUTES}min | "
        f"check_interval={PURGE_INTERVAL_SECONDS}s"
    )
    while True:
        try:
            await asyncio.to_thread(purge_expired_files)
        except Exception as e:
            logger.error(f"Purge scheduler unhandled error: {e}")
        await asyncio.sleep(PURGE_INTERVAL_SECONDS)