from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
from datetime import datetime, date
from database import insert_task, get_tasks_by_user, update_task, delete_task, link_task_to_user, database  # Import the database object
from fastapi.responses import JSONResponse
import logging

# Initialize APIRouter instance
router = APIRouter()

# Pydantic models for task creation and response
class TaskCreate(BaseModel):
    title: str
    description: str
    due_date: date
    priority: str
    status: str
    user_id: int

class TaskResponse(BaseModel):
    task_id: int
    title: str
    description: str
    due_date: date
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
            task.title, task.description, task.due_date, task.priority, task.status
        )
        if not new_task:
            logging.error("Task insertion failed")
            raise HTTPException(status_code=400, detail="Error creating task")

        logging.debug(f"Task inserted with ID: {new_task.get('task_id')}")

        # Link the new task to the user via the links table
        task_id = new_task.get('task_id')
        if not task_id:
            logging.error("No task_id returned after insertion")
            raise HTTPException(status_code=500, detail="Failed to retrieve task_id after creation")

        link_success = await link_task_to_user(task_id, task.user_id)
        if not link_success:
            logging.error(f"Error linking task {task_id} to user {task.user_id}")
            raise HTTPException(status_code=400, detail="Error linking task to user")

        logging.debug(f"Task {task_id} linked to user {task.user_id}")
        return new_task

    except Exception as e:
        logging.error(f"Task creation error for user {task.user_id}: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"detail": f"An internal error occurred: {str(e)}"},
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
        )


# Endpoint to update a task
@router.put("/update/{task_id}", response_model=TaskResponse)
async def update_task_endpoint(task_id: int, task: TaskCreate):
    try:
        logging.debug(f"Updating task {task_id} for user {task.user_id}")
        
        # Fetch the specific task by task_id, not by user_id
        existing_task_query = """
        SELECT tasks.task_id, tasks.title, tasks.description, tasks.due_date, tasks.priority, tasks.status, tasks.created_at, links.user_id
        FROM tasks
        INNER JOIN links ON tasks.task_id = links.task_id
        WHERE tasks.task_id = :task_id
        """
        
        existing_task = await database.fetch_one(query=existing_task_query, values={"task_id": task_id})
        
        if not existing_task:
            raise HTTPException(status_code=404, detail="Task not found")
        
        if existing_task['user_id'] != task.user_id:
            raise HTTPException(status_code=403, detail="Not authorized to update this task")
        
        # Update the task
        updated_task = await update_task(task_id, task.user_id, task.title, task.description, task.due_date, task.priority, task.status)
        if not updated_task:
            raise HTTPException(status_code=404, detail="Task not found")

        logging.debug(f"Task {task_id} updated successfully")
        return updated_task

    except Exception as e:
        logging.error(f"Error updating task {task_id}: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"detail": f"An internal error occurred while updating the task: {str(e)}"},
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
        )
