from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
from datetime import datetime
from sqlalchemy.exc import IntegrityError
from database import (
    insert_calendar_entry, 
    get_calendar_entries, 
    delete_calendar_entry,
    update_calendar_entry, 
    get_calendar_entry_by_user_and_task  
)

# Initialize APIRouter instance
router = APIRouter()

# Pydantic models for calendar entry creation and response
class CalendarCreate(BaseModel):
    task_id: int
    user_id: int

class CalendarUpdate(BaseModel):
    task_id: int
    user_id: int

class CalendarResponse(BaseModel):
    calendar_id: int
    task_id: int
    user_id: int
    created_at: datetime

# Endpoint to create a new calendar entry
@router.post("/calendar", response_model=CalendarResponse)
async def create_calendar_entry(entry: CalendarCreate):
    try:
        # Check if a calendar entry with the same user_id and task_id already exists
        existing_entry = await get_calendar_entry_by_user_and_task(entry.user_id, entry.task_id)
        if existing_entry:
            raise HTTPException(status_code=409, detail="Calendar entry already exists for the specified user and task")

        # Insert the new calendar entry into the database and return the result
        result = await insert_calendar_entry(entry.task_id, entry.user_id)
        if not result:
            raise HTTPException(status_code=400, detail="Error creating calendar entry")
        return result
    except IntegrityError:
        raise HTTPException(status_code=409, detail="Duplicate calendar entry detected")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")

# Endpoint to get calendar entries by user ID
@router.get("/calendar/{user_id}", response_model=List[CalendarResponse])
async def read_calendar(user_id: int):
    try:
        entries = await get_calendar_entries(user_id)
        if not entries:
            raise HTTPException(status_code=404, detail="No calendar entries found for the specified user")
        return entries
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")

# Endpoint to update a calendar entry by ID
@router.put("/calendar/{calendar_id}", response_model=CalendarResponse)
async def update_calendar_entry_endpoint(calendar_id: int, entry: CalendarUpdate):
    try:
        # Update the existing calendar entry in the database
        result = await update_calendar_entry(calendar_id, entry.task_id, entry.user_id)
        if not result:
            raise HTTPException(status_code=404, detail="Calendar entry not found")
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")

# Endpoint to delete a calendar entry
@router.delete("/calendar/{calendar_id}")
async def delete_calendar_entry_endpoint(calendar_id: int):
    try:
        result = await delete_calendar_entry(calendar_id)
        if not result:
            raise HTTPException(status_code=404, detail="Calendar entry not found")
        return {"detail": "Calendar entry deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")
