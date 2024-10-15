from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
from database import link_task_to_user, get_tasks_by_user
import logging

# Initialize APIRouter instance
router = APIRouter()

# Pydantic models
class LinkResponse(BaseModel):
    task_id: int
    user_id: int

class TaskResponse(BaseModel):
    task_id: int
    title: str
    description: str
    due_date: str
    priority: str
    status: str

# Endpoint to link a task to a user
@router.post("/link-task")
async def link_task(task_id: int, user_id: int):
    try:
        # Check if task exists
        task = await get_task_by_id(task_id)  # Add this function to fetch task by ID
        if not task:
            raise HTTPException(status_code=404, detail=f"Task with ID {task_id} not found")

        # Check if user exists (use existing user-fetching logic)
        user = await get_user_by_id(user_id)
        if not user:
            raise HTTPException(status_code=404, detail=f"User with ID {user_id} not found")

        # Proceed with linking
        result = await link_task_to_user(task_id, user_id)
        if not result:
            raise HTTPException(status_code=400, detail="Error linking task to user")
        logging.debug(f"Task {task_id} linked to user {user_id}")
        return LinkResponse(task_id=task_id, user_id=user_id)
    except Exception as e:
        logging.error(f"Error linking task {task_id} to user {user_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal error occurred: {str(e)}")

# Endpoint to get tasks by user
@router.get("/tasks-by-user/{user_id}", response_model=List[TaskResponse])
async def get_tasks(user_id: int):
    try:
        logging.debug(f"Fetching tasks for user {user_id}")
        tasks = await get_tasks_by_user(user_id)
        if not tasks:
            logging.warning(f"No tasks found for user {user_id}")
            return []
        logging.debug(f"Fetched tasks for user {user_id}: {tasks}")
        return tasks
    except Exception as e:
        logging.error(f"Error fetching tasks for user {user_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal error occurred: {str(e)}")

