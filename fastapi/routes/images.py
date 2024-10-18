from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel
from datetime import datetime
from typing import List
from database import insert_image, get_images_by_user, delete_image
import logging

router = APIRouter()

# Pydantic model for response
class ImageResponse(BaseModel):
    image_id: int
    user_id: int
    uploaded_at: datetime 

    class Config:
        orm_mode = True  # Ensures that Pydantic can read from the ORM models
        json_encoders = {
            datetime: lambda v: v.isoformat()  # Convert datetime to ISO format string
        }    

# Endpoint to upload an image
@router.post("/upload/{user_id}", response_model=ImageResponse)
async def upload_image(user_id: int, file: UploadFile = File(...)):
    try:
        # Read the image file data as binary
        image_data = await file.read()

        # Insert image record into the database
        result = await insert_image(user_id, image_data)
        return result

    except Exception as e:
        # Log the error and full traceback for better debugging
        logging.error(f"Error uploading image: {str(e)}")
        logging.error(traceback.format_exc())  # Logs the full traceback of the error
        raise HTTPException(status_code=500, detail="Error uploading image")

# Endpoint to fetch images by user_id (returns metadata without binary data)
@router.get("/user/{user_id}", response_model=List[ImageResponse])
async def get_images(user_id: int):
    try:
        result = await get_images_by_user(user_id)
        if not result:
            raise HTTPException(status_code=404, detail="No images found for the user")
        return result
    except Exception as e:
        logging.error(f"Error fetching images: {str(e)}")
        raise HTTPException(status_code=500, detail="Error fetching images")

# Endpoint to delete an image by image_id
@router.delete("/delete/{image_id}")
async def delete_image_endpoint(image_id: int):
    try:
        # Delete image from the database
        image_record = await delete_image(image_id)
        if not image_record:
            raise HTTPException(status_code=404, detail="Image not found")
        return {"detail": "Image deleted successfully"}
    except Exception as e:
        logging.error(f"Error deleting image: {str(e)}")
        raise HTTPException(status_code=500, detail="Error deleting image")
