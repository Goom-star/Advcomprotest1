# from fastapi import APIRouter, Depends, HTTPException
# from sqlalchemy.orm import Session
# from pydantic import BaseModel
# from datetime import date
# from database import get_db

# router = APIRouter()

# # Pydantic model to parse event data
# class CalendarEvent(BaseModel):
#     title: str
#     description: str
#     date: date

# # Example in-memory database (replace with SQLAlchemy query in real case)
# events_db = [
#     {"id": 1, "title": "Meeting", "description": "Project meeting", "date": date(2024, 10, 11)},
#     {"id": 2, "title": "Workout", "description": "Gym session", "date": date(2024, 10, 12)},
# ]

# @router.get("/calendar/events")
# def get_events_for_date(event_date: date, db: Session = Depends(get_db)):
#     # Replace with actual SQL query to fetch events from the database
#     events_for_date = [event for event in events_db if event["date"] == event_date]
#     if not events_for_date:
#         raise HTTPException(status_code=404, detail="No events found for this date")
#     return events_for_date
