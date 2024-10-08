from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
from datetime import datetime, date
from database import insert_task, get_tasks_by_user, update_task, delete_task, link_task_to_user  # Import necessary functions
from sqlalchemy.ext.asyncio import AsyncSession

# Initialize APIRouter instance
router = APIRouter()

# Pydantic models for task creation and response
class TaskCreate(BaseModel):
    title: str
    description: str
    dueDate: date
    priority: str
    status: str
    user_id: int


class TaskResponse(BaseModel):
    task_id: int
    title: str
    description: str
    dueDate: date
    priority: str
    status: str
    created_at: datetime

class LinkResponse(BaseModel):
    task_id: int
    user_id: int

# Endpoint to create a new task
@router.post("/create", response_model=TaskResponse)
async def create_task(task: TaskCreate):
    try:
        if not task.status in ["Incomplete", "Complete"]:
            raise HTTPException(status_code=500, detail="Task must be incomplete or complete only")
        
        # Insert the new task into the tasks table
        new_task = await insert_task(task.title, task.description, task.dueDate, task.priority, task.status)
        
        if not new_task:
            raise HTTPException(status_code=400, detail="Error creating task")
        
        # Link the new task to the user via the links table
        link_success = await link_task_to_user(new_task.task_id, task.user_id)  # Use task.user_id
        
        if not link_success:
            raise HTTPException(status_code=400, detail="Error linking task to user")
        
        return new_task
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")


# Endpoint to get tasks by user ID
@router.get("/fetch/{user_id}", response_model=List[TaskResponse])
async def read_tasks(user_id: int):
    result = await get_tasks_by_user(user_id)
    if result is None:
       raise HTTPException(status_code=404, detail="User not found")
    return result


# Endpoint to update a task
@router.put("/update/{task_id}", response_model=TaskResponse)
async def update_task_endpoint(task_id: int, task: TaskCreate):
    try:
        updated_task = await update_task(task_id, task.title, task.description, task.dueDate, task.priority, task.status)
        if not updated_task:
            raise HTTPException(status_code=404, detail="Task not found")
        return updated_task
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")

# Endpoint to delete a task
@router.delete("/delete/{task_id}")
async def delete_task_endpoint(task_id: int):
    try:
        result = await delete_task(task_id)
        if not result:
            raise HTTPException(status_code=404, detail="Task not found")
        return {"detail": "Task deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")
