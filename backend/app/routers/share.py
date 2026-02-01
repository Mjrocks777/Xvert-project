from fastapi import APIRouter

router = APIRouter()

@router.post("/create")
async def create_share_link():
    return {"message": "Share link created"}

@router.get("/{token}")
async def get_shared_file(token: str):
    return {"message": "Shared file access"}
