from databases import Database
from datetime import date
import logging
from fastapi import HTTPException
from databases.backends.common.records import Record

POSTGRES_USER = "temp"
POSTGRES_PASSWORD = "temp"
POSTGRES_DB = "advcompro"
POSTGRES_HOST = "db"

DATABASE_URL = f'postgresql+asyncpg://{POSTGRES_USER}:{POSTGRES_PASSWORD}@{POSTGRES_HOST}/{POSTGRES_DB}'
database = Database(DATABASE_URL)

# Database connection
async def connect_db():
    try:
        await database.connect()
        logging.info("Database connected successfully.")
    except Exception as e:
        logging.error(f"Error connecting to the database: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to connect to the database.")

# Database disconnection
async def disconnect_db():
    try:
        await database.disconnect()
        logging.info("Database disconnected successfully.")
    except Exception as e:
        logging.error(f"Error disconnecting from the database: {str(e)}")

# Function to insert a new user into the users table
async def insert_user(username: str, password_hash: str, email: str):
    query = """
    INSERT INTO users (username, password_hash, email)
    VALUES (:username, :password_hash, :email)
    RETURNING user_id, username, password_hash, email, created_at
    """
    values = {"username": username, "password_hash": password_hash, "email": email}
    try:
        return await database.fetch_one(query=query, values=values)
    except Exception as e:
        logging.error(f"Error inserting user {username}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to insert user: {str(e)}")

# Function to select a user by username
async def get_user(username: str):
    query = "SELECT * FROM users WHERE username = :username"
    try:
        return await database.fetch_one(query=query, values={"username": username})
    except Exception as e:
        logging.error(f"Error fetching user {username}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch user: {str(e)}")

# Function to select a user by email and password_hash
async def get_user_by_email(email: str, password_hash: str):
    query = "SELECT * FROM users WHERE email = :email and password_hash = :password_hash"
    try:
        return await database.fetch_one(query=query, values={"email": email, "password_hash": password_hash})
    except Exception as e:
        logging.error(f"Error fetching user by email {email}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch user: {str(e)}")

# Function to update a user in the users table
async def update_user(user_id: int, username: str, password_hash: str, email: str):
    query = """
    UPDATE users
    SET username = :username, password_hash = :password_hash, email = :email
    WHERE user_id = :user_id
    RETURNING user_id, username, password_hash, email, created_at
    """
    values = {"user_id": user_id, "username": username, "password_hash": password_hash, "email": email}
    try:
        return await database.fetch_one(query=query, values=values)
    except Exception as e:
        logging.error(f"Error updating user {user_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to update user: {str(e)}")

# Function to delete a user from the users table
async def delete_user(user_id: int):
    query = "DELETE FROM users WHERE user_id = :user_id RETURNING *"
    try:
        return await database.fetch_one(query=query, values={"user_id": user_id})
    except Exception as e:
        logging.error(f"Error deleting user {user_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to delete user: {str(e)}")

# Function to insert a new task into the tasks table
async def insert_task(title: str, description: str, dueDate: date, priority: str, status: str):
    query = """
    INSERT INTO tasks (title, description, dueDate, priority, status)
    VALUES (:title, :description, :dueDate, :priority, :status)
    RETURNING id AS task_id, title, description, dueDate, priority, status
    """
    values = {
        "title": title,
        "description": description,
        "dueDate": dueDate,
        "priority": priority,
        "status": status
    }
    try:
        return await database.fetch_one(query=query, values=values)
    except Exception as e:
        logging.error(f"Error inserting task {title}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to insert task: {str(e)}")

# Function to link a task to a user in the links table
async def link_task_to_user(task_id: int, user_id: int):
    query = """
    INSERT INTO links (task_id, user_id)
    VALUES (:task_id, :user_id)
    RETURNING task_id, user_id
    """
    values = {"task_id": task_id, "user_id": user_id}
    try:
        return await database.fetch_one(query=query, values=values)
    except Exception as e:
        logging.error(f"Error linking task {task_id} to user {user_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to link task: {str(e)}")

# Function to get tasks for a specific user by querying the links table
async def get_tasks_by_user(user_id: int):
    query = """
    SELECT id, title, description, duedate, priority, status, created_at
    FROM tasks
    INNER JOIN links ON tasks.id = links.task_id
    WHERE links.user_id = :user_id
    """
    try:
        result = await database.fetch_all(query=query, values={"user_id": user_id})

        # Convert Record objects to dictionaries and ensure date fields are serialized
        tasks = []
        for task in result:
            task_dict = dict(task)
            
            # Ensure that dueDate is serialized as a string in ISO 8601 format
            task_dict['dueDate'] = task_dict['dueDate'].isoformat() if isinstance(task_dict['dueDate'], (date,)) else task_dict['dueDate']
            task_dict['created_at'] = task_dict['created_at'].isoformat() if isinstance(task_dict['created_at'], (date,)) else task_dict['created_at']

            tasks.append(task_dict)
        
        logging.debug(f"Fetched tasks: {tasks}")
        return tasks
    except Exception as e:
        logging.error(f"Error fetching tasks for user {user_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch tasks: {str(e)}")


# Function to update a task in the tasks table
async def update_task(task_id: int, title: str, description: str, dueDate: date, priority: str, status: str):
    query = """
    UPDATE tasks
    SET title = :title, description = :description, dueDate = :dueDate, priority = :priority, status = :status
    WHERE id = :task_id
    RETURNING id AS task_id, title, description, dueDate, priority, status
    """
    values = {
        "task_id": task_id,
        "title": title,
        "description": description,
        "dueDate": dueDate,
        "priority": priority,
        "status": status
    }
    try:
        return await database.fetch_one(query=query, values=values)
    except Exception as e:
        logging.error(f"Error updating task {task_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to update task: {str(e)}")

# Function to delete a task from the tasks table
async def delete_task(task_id: int):
    query = "DELETE FROM tasks WHERE id = :task_id RETURNING *"
    try:
        return await database.fetch_one(query=query, values={"task_id": task_id})
    except Exception as e:
        logging.error(f"Error deleting task {task_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to delete task: {str(e)}")