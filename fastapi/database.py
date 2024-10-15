from databases import Database
from datetime import date
import logging
from fastapi import HTTPException
from sqlalchemy import text
from datetime import datetime

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
# Insert task with validation
async def insert_task(title: str, description: str, due_date: date, priority: str, status: str):
    query = """
    INSERT INTO tasks (title, description, due_date, priority, status)
    VALUES (:title, :description, :due_date, :priority, :status)
    RETURNING task_id, title, description, due_date, priority, status, created_at
    """
    values = {
        "title": title,
        "description": description,
        "due_date": due_date,
        "priority": priority,
        "status": status
    }
    
    try:
        # Validate date
        due_date = validate_due_date(due_date)

        # Insert task into DB
        result = await database.fetch_one(query=query, values=values)
        if result:
            logging.debug(f"Inserted task: {dict(result)}")
            return dict(result)  # Ensure returning as dict to avoid Record object issues
        else:
            logging.warning("No result after inserting the task.")
            raise HTTPException(status_code=500, detail="Task insertion failed: no result")
    except Exception as e:
        logging.error(f"Error inserting task: {str(e)} | Task data: {title}, {description}, {due_date}, {priority}, {status}")
        raise HTTPException(status_code=500, detail="Error inserting task")





async def create_task_endpoint(task_data):
    try:
        # Log the incoming task data
        logging.debug(f"Creating task with data: {task_data}")

        # Insert the new task
        new_task = await insert_task(
            task_data['title'], 
            task_data['description'], 
            task_data['due_date'], 
            task_data['priority'], 
            task_data['status']
        )

        if not new_task:
            raise HTTPException(status_code=500, detail="Task creation failed")
        
        # Log the inserted task
        logging.debug(f"Task created: {new_task}")

        # Link the task to the user
        task_id = new_task['task_id']
        user_id = task_data['user_id']
        link_success = await link_task_to_user(task_id, user_id)

        if not link_success:
            raise HTTPException(status_code=500, detail="Linking task to user failed")
        
        # Log linking success
        logging.debug(f"Task {task_id} successfully linked to user {user_id}")
        
        return new_task  # Return the task as the response
    except Exception as e:
        logging.error(f"Task creation error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal error occurred: {str(e)}")



# Function to get tasks for a specific user
async def get_tasks_by_user(user_id: int):
    query = """
    SELECT tasks.task_id, tasks.title, tasks.description, tasks.due_date, tasks.priority, tasks.status, tasks.created_at
    FROM tasks
    INNER JOIN links ON tasks.task_id = links.task_id
    WHERE links.user_id = :user_id
    """
    try:
        logging.debug(f"Fetching tasks for user {user_id}")
        result = await database.fetch_all(query=query, values={"user_id": user_id})

        tasks = [dict(task) for task in result]
        
        logging.debug(f"Fetched tasks: {tasks}")
        return tasks
    except Exception as e:
        logging.error(f"Error fetching tasks for user {user_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch tasks: {str(e)}")

async def update_task(task_id: int, user_id: int, title: str, description: str, due_date: date, priority: str, status: str):
    # Validate that the task exists for the user before updating
    task_exists_query = """
    SELECT tasks.task_id FROM tasks
    INNER JOIN links ON tasks.task_id = links.task_id
    WHERE tasks.task_id = :task_id AND links.user_id = :user_id
    """
    
    task_exists = await database.fetch_one(query=task_exists_query, values={"task_id": task_id, "user_id": user_id})
    
    if not task_exists:
        logging.error(f"Task {task_id} not found for user {user_id}")
        raise HTTPException(status_code=404, detail=f"Task with ID {task_id} not found for user {user_id}")

    # Proceed with the update if the task exists
    query = """
    UPDATE tasks
    SET title = :title, description = :description, due_date = :due_date, priority = :priority, status = :status
    WHERE task_id = :task_id
    RETURNING task_id, title, description, due_date, priority, status, created_at  -- Ensure created_at is included
    """
    
    values = {
        "task_id": task_id,
        "title": title,
        "description": description,
        "due_date": due_date,
        "priority": priority,
        "status": status
    }

    try:
        logging.debug(f"Updating task {task_id} for user {user_id} with values: {values}")
        updated_task = await database.fetch_one(query=query, values=values)
        logging.debug(f"Task {task_id} updated successfully for user {user_id}")
        return updated_task  # Ensure this includes all necessary fields for response
    except Exception as e:
        logging.error(f"Error updating task {task_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to update task: {str(e)}")


# Function to link a task to a user in the links table
async def link_task_to_user(task_id: int, user_id: int):
    # Check if the link already exists
    check_query = """
    SELECT * FROM links WHERE task_id = :task_id AND user_id = :user_id
    """
    existing_link = await database.fetch_one(query=check_query, values={"task_id": task_id, "user_id": user_id})
    
    if existing_link:
        raise HTTPException(status_code=400, detail="Task is already linked to the user.")
    
    # Proceed with linking if no link exists
    query = """
    INSERT INTO links (task_id, user_id)
    VALUES (:task_id, :user_id)
    RETURNING task_id, user_id
    """
    values = {"task_id": task_id, "user_id": user_id}
    
    try:
        result = await database.fetch_one(query=query, values=values)
        logging.debug(f"Task {task_id} linked to user {user_id}")
        return result
    except Exception as e:
        logging.error(f"Error linking task to user: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error linking task to user: {str(e)}")




# Function to delete a task from the tasks table
async def delete_task(task_id: int):
    query = "DELETE FROM tasks WHERE task_id = :task_id RETURNING *"
    try:
        return await database.fetch_one(query=query, values={"task_id": task_id})
    except Exception as e:
        logging.error(f"Error deleting task {task_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to delete task: {str(e)}")



def validate_due_date(due_date: date):
    if isinstance(due_date, str):
        try:
            # Convert string to date
            due_date = datetime.strptime(due_date, "%Y-%m-%d").date()
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid due date format. Use YYYY-MM-DD.")
    
    # Check if the due date is in the future
    if due_date < datetime.today().date():
        raise HTTPException(status_code=400, detail="Due date cannot be in the past.")

    return due_date
