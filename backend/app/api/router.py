from fastapi import APIRouter

from app.api.routes import employees, health, insights

api_router = APIRouter()
api_router.include_router(health.router, tags=["health"])
api_router.include_router(employees.router)
api_router.include_router(insights.router)
