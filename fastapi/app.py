from typing import Union
import logging  # Import logging module

# Configure logging to output debug level logs
logging.basicConfig(level=logging.DEBUG)
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from database import *
from routes.users import router as users_router
from routes.tasks import router as tasks_router  # Import the tasks router
from sqlalchemy import select

app = FastAPI()

origins = [
    "http://localhost:3000",  # Allow requests from your React frontend
    "http://127.0.0.1:3000"   # Allow requests from the localhost (alternate IP)
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Allow requests from React app
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods (POST, GET, etc.)
    allow_headers=["*"],  # Allow all headers
)

# Include your routes after the CORS middleware
app.include_router(users_router, prefix="/api/users")
app.include_router(tasks_router, prefix="/api/tasks")

@app.on_event("startup")
async def startup():
    await connect_db()

@app.on_event("shutdown")
async def shutdown():
    await disconnect_db()
