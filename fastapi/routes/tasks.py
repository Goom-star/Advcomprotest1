from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
from datetime import datetime, date
from database import insert_task, get_tasks_by_user, update_task, delete_task, link_task_to_user  # Import necessary functions
from fastapi.responses import JSONResponse
import logging

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
@router.post("/create")
async def create_task(task: TaskCreate):
    try:
        logging.debug(f"Creating a new task for user {task.user_id} with title {task.title}")
        
        # Insert the new task into the tasks table
        new_task = await insert_task(
            task.title, task.description, task.dueDate, task.priority, task.status
        )
        if not new_task:
            raise HTTPException(status_code=400, detail="Error creating task")

        # Link the new task to the user via the links table
        link_success = await link_task_to_user(new_task.task_id, task.user_id)
        if not link_success:
            raise HTTPException(status_code=400, detail="Error linking task to user")

        logging.debug(f"Task created successfully for user {task.user_id}")
        return new_task

    except Exception as e:
        logging.error(f"Task creation error for user {task.user_id}: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"detail": f"An internal error occurred: {str(e)}"},
            headers={"Access-Control-Allow-Origin": "http://localhost:3000"}
        )

# Endpoint to get tasks by user ID
@router.get("/fetch/{user_id}", response_model=List[TaskResponse])
async def read_tasks(user_id: int):
    try:
        logging.debug(f"Fetching tasks for user {user_id}")
        
        result = await get_tasks_by_user(user_id)
        
        # If result is empty, return an empty list (not a 404)
        if result is None or len(result) == 0:
            logging.info(f"No tasks found for user {user_id}")
            return []

        logging.debug(f"Fetched {len(result)} tasks for user {user_id}")
        return result
    except Exception as e:
        logging.error(f"Error fetching tasks for user {user_id}: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"detail": "Failed to fetch tasks."},  # Do not expose internal errors to the client
            headers={"Access-Control-Allow-Origin": "http://localhost:3000"}  # Ensure CORS for dev
        )


# Endpoint to update a task
@router.put("/update/{task_id}", response_model=TaskResponse)
async def update_task_endpoint(task_id: int, task: TaskCreate):
    try:
        logging.debug(f"Updating task {task_id} for user {task.user_id}")
        
        # Fetch the task and check if it belongs to the current user
        existing_task = await get_tasks_by_user(task_id)  
        if existing_task.user_id != task.user_id:
            raise HTTPException(status_code=403, detail="Not authorized to update this task")
        
        updated_task = await update_task(task_id, task.title, task.description, task.dueDate, task.priority, task.status)
        if not updated_task:
            raise HTTPException(status_code=404, detail="Task not found")

        logging.debug(f"Task {task_id} updated successfully")
        return updated_task

    except Exception as e:
        logging.error(f"Error updating task {task_id}: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"detail": f"An internal error occurred while updating the task: {str(e)}"},
            headers={"Access-Control-Allow-Origin": "http://localhost:3000"}
        )

# Endpoint to delete a task
@router.delete("/delete/{task_id}")
async def delete_task_endpoint(task_id: int):
    try:
        logging.debug(f"Deleting task {task_id}")
        
        result = await delete_task(task_id)
        if not result:
            raise HTTPException(status_code=404, detail="Task not found")

        logging.debug(f"Task {task_id} deleted successfully")
        return {"detail": "Task deleted successfully"}

    except Exception as e:
        logging.error(f"Error deleting task {task_id}: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"detail": f"An internal error occurred while deleting the task: {str(e)}"},
            headers={"Access-Control-Allow-Origin": "http://localhost:3000"}
        )
