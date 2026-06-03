from fastapi import APIRouter

from app.api.routes import employees, health

api_router = APIRouter()
api_router.include_router(health.router, tags=["health"])
api_router.include_router(employees.router)
