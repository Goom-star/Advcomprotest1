from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import logging
from routes.users import router as users_router
from routes.tasks import router as tasks_router
from routes.links import router as links_router
#from routes.calendar import router as calendar_router
from database import connect_db, disconnect_db
from fastapi.responses import JSONResponse
from starlette.middleware.errors import ServerErrorMiddleware

app = FastAPI()

# Set allowed origins for CORS
origins = [
    "http://localhost:3000",  # React app running on this address for local development
    # Add other domains here for production as needed
]

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Allows requests from specified origins
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods (POST, GET, etc.)
    allow_headers=["*"],  # Allow all headers
)

# Add error handling middleware
app.add_middleware(ServerErrorMiddleware, debug=True)

# Database connection on startup
@app.on_event("startup")
async def startup():
    try:
        await connect_db()
        logging.info("Database connection successful")
    except Exception as e:
        logging.error(f"Database connection failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to connect to the database.")

# Database disconnection on shutdown
@app.on_event("shutdown")
async def shutdown():
    try:
        await disconnect_db()
        logging.info("Database disconnected successfully")
    except Exception as e:
        logging.error(f"Error during database disconnection: {e}")

# Logging for request/response headers and preflight requests
logging.basicConfig(level=logging.DEBUG)

@app.middleware("http")
async def log_requests(request, call_next):
    logging.debug(f"Incoming request method: {request.method}")
    logging.debug(f"Incoming request headers: {request.headers}")

    # Handle CORS preflight requests (OPTIONS method)
    if request.method == "OPTIONS":
        logging.debug("Preflight request detected")
    
    response = await call_next(request)
    
    # Log response headers
    logging.debug(f"Outgoing response headers: {response.headers}")
    
    # Ensure CORS headers are present (in case middleware fails)
    response.headers["Access-Control-Allow-Origin"] = "http://localhost:3000"
    return response

# Global Exception Handler for detailed error messages and CORS response
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logging.error(f"An unexpected error occurred: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={"message": "An internal error occurred. Please try again later."},
        headers={"Access-Control-Allow-Origin": "http://localhost:3000"}  # Explicit CORS header in error responses
    )

# Include routers
app.include_router(links_router, prefix="/api/links")
app.include_router(users_router, prefix="/api/users")
app.include_router(tasks_router, prefix="/api/tasks")
#app.include_router(calendar_router, prefix="/api/calendar")

# For testing purposes: An example of handling CORS and making sure that the Access-Control-Allow-Origin header is present
@app.get("/test-cors")
async def test_cors():
    return {"message": "CORS is working fine!"}