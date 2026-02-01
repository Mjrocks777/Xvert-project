from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from app.services.image_converter import ImageConverter
from app.services.document_converter import DocumentConverter
from app.services.data_converter import DataConverter
import traceback

router = APIRouter()

@router.post("/image")
async def convert_image(file: UploadFile = File(...), format: str = Form(...)):
    try:
        content = await file.read()
        converted_content = ImageConverter.convert(content, format)
        
        # In a real app, we'd upload this to Supabase Storage and return the URL
        # For MVP/testing, we might want to return the file directly or a signed URL
        # For now, let's just return success message
        return {"message": f"Successfully converted {file.filename} to {format}", "size": len(converted_content)}
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/document")
async def convert_document(file: UploadFile = File(...), target_format: str = Form(...)):
    return {"message": "Document conversion not implemented yet"}

@router.post("/data")
async def convert_data(file: UploadFile = File(...), target_format: str = Form(...)):
    return {"message": "Data conversion not implemented yet"}
