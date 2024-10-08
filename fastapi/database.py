from databases import Database
from datetime import date, datetime

POSTGRES_USER = "temp"
POSTGRES_PASSWORD = "temp"
POSTGRES_DB = "advcompro"
POSTGRES_HOST = "db"


DATABASE_URL = f'postgresql+asyncpg://{POSTGRES_USER}:{POSTGRES_PASSWORD}@{POSTGRES_HOST}/{POSTGRES_DB}'


database = Database(DATABASE_URL)


async def connect_db():
   await database.connect()
   print("Database connected")


async def disconnect_db():
   await database.disconnect()
   print("Database disconnected")


# Function to insert a new user into the users table
async def insert_user(username: str, password_hash: str, email: str):
   query = """
   INSERT INTO users (username, password_hash, email)
   VALUES (:username, :password_hash, :email)
   RETURNING user_id, username, password_hash, email, created_at
   """
   values = {"username": username, "password_hash": password_hash, "email": email}
   return await database.fetch_one(query=query, values=values)


# Function to select a user by user_id from the users table
async def get_user(username: str):
   query = "SELECT * FROM users WHERE username = :username"
   return await database.fetch_one(query=query, values={"username": username})


# Function to select a user by email from the users table
async def get_user_by_email(email: str,password_hash:str):
   query = "SELECT * FROM users WHERE email = :email and password_hash = :password_hash"
   return await database.fetch_one(query=query, values={"email": email,"password_hash": password_hash})


# Function to update a user in the users table
async def update_user(user_id: int, username: str, password_hash: str, email: str):
   query = """
   UPDATE users
   SET username = :username, password_hash = :password_hash, email = :email
   WHERE user_id = :user_id
   RETURNING user_id, username, password_hash, email, created_at
   """
   values = {"user_id": user_id, "username": username, "password_hash": password_hash, "email": email}
   return await database.fetch_one(query=query, values=values)


# Function to delete a user from the users table
async def delete_user(user_id: int):
   query = "DELETE FROM users WHERE user_id = :user_id RETURNING *"
   return await database.fetch_one(query=query, values={"user_id": user_id})
   
# Add functions for task-related operations
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
    return await database.fetch_one(query=query, values=values)


# Function to link a task to a user in the links table
async def link_task_to_user(task_id: int, user_id: int):
    query = """
    INSERT INTO links (task_id, user_id)
    VALUES (:task_id, :user_id)
    RETURNING task_id, user_id
    """
    values = {"task_id": task_id, "user_id": user_id}
    return await database.fetch_one(query=query, values=values)


# Function to get tasks for a specific user by querying the links table
async def get_tasks_by_user(user_id: int):
    query = """
    SELECT t.id AS task_id, t.title, t.description, t.dueDate, t.priority, t.status, t.created_at
    FROM tasks t
    INNER JOIN links l ON t.id = l.task_id
    WHERE l.user_id = :user_id
    """
    return await database.fetch_all(query=query, values={"user_id": user_id})


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
    return await database.fetch_one(query=query, values=values)


# Function to delete a task from the tasks table
async def delete_task(task_id: int):
    query = "DELETE FROM tasks WHERE id = :task_id RETURNING *"
    return await database.fetch_one(query=query, values={"task_id": task_id})
