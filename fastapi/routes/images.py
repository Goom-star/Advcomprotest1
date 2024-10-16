# from fastapi import APIRouter, UploadFile, File, HTTPException
# from fastapi.responses import StreamingResponse
# import io
# import imghdr
# from database import insert_or_update_user_image, get_user_image, delete_user_image
# from PIL import Image
# from io import BytesIO

# # Create a new router for image-related endpoints
# router = APIRouter()

# # Upload an image for a user with file validation and optional thumbnail generation
# @router.post("/upload-image/{user_id}")
# async def upload_image(user_id: int, file: UploadFile = File(...)):
#     # Read the image data from the uploaded file
#     image_data = await file.read()

#     # Validate the image file type
#     file_type = imghdr.what(None, h=image_data)
#     if file_type not in ["jpeg", "png"]:
#         raise HTTPException(status_code=400, detail="Invalid image format. Only JPEG and PNG are supported.")

#     # Optionally: Generate a thumbnail (e.g., resize the image)
#     image = Image.open(BytesIO(image_data))
#     image.thumbnail((150, 150))  # Resize to thumbnail size (150x150)
#     thumbnail_io = BytesIO()
#     image.save(thumbnail_io, format=image.format)
#     thumbnail_data = thumbnail_io.getvalue()

#     # Store the thumbnail (or the original image if no resizing is needed) in the database
#     result = await insert_or_update_user_image(user_id, thumbnail_data)
#     if result:
#         return {"message": "Image uploaded successfully", "user_id": result["user_id"]}
#     raise HTTPException(status_code=500, detail="Image upload failed")

# # Retrieve a user's image
# @router.get("/get-image/{user_id}")
# async def get_image(user_id: int):
#     # Retrieve the image from the database
#     image_record = await get_user_image(user_id)

#     if image_record and image_record["image_data"]:
#         return StreamingResponse(io.BytesIO(image_record["image_data"]), media_type="image/jpeg")
#     else:
#         raise HTTPException(status_code=404, detail="Image not found")


# # Optional: Delete a user's image
# @router.delete("/delete-image/{user_id}")
# async def delete_image(user_id: int):
#     result = await delete_user_image(user_id)
#     if result:
#         return {"message": "Image deleted successfully"}
#     raise HTTPException(status_code=404, detail="Image not found")