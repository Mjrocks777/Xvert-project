from fastapi import APIRouter, Depends, HTTPException
from app.services.supabase_service import get_supabase
from typing import List

router = APIRouter()

@router.get("/history")
async def get_history():
    # Placeholder for getting user history
    # user = get_current_user()
    # return supabase.table('conversions').select('*').eq('user_id', user.id).execute()
    return [{"id": "1", "filename": "example.png", "status": "completed"}]

@router.delete("/{id}")
async def delete_file(id: str):
    return {"message": f"File {id} deleted"}
