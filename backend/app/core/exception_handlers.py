from fastapi import Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from app.core.exceptions import AppError
from app.schemas.common import ErrorDetail, ErrorEnvelope, ErrorResponse


def _error_response(status_code: int, code: str, message: str, details=None) -> JSONResponse:
    payload = ErrorEnvelope(
        error=ErrorResponse(code=code, message=message, details=details)
    )
    return JSONResponse(status_code=status_code, content=payload.model_dump(exclude_none=True))


async def app_error_handler(_: Request, exc: AppError) -> JSONResponse:
    status_code_map = {
        "NOT_FOUND": 404,
        "VALIDATION_ERROR": 422,
        "CONFLICT": 409,
    }
    status_code = status_code_map.get(exc.code, 500)
    return _error_response(status_code, exc.code, exc.message)


async def validation_error_handler(
    _: Request,
    exc: RequestValidationError,
) -> JSONResponse:
    details = [
        ErrorDetail(
            field=".".join(str(item) for item in error.get("loc", []) if item != "body"),
            message=error.get("msg", "Invalid value"),
        )
        for error in exc.errors()
    ]
    return _error_response(
        422,
        "VALIDATION_ERROR",
        "Invalid request data",
        details,
    )


async def unhandled_error_handler(_: Request, __: Exception) -> JSONResponse:
    return _error_response(500, "INTERNAL_ERROR", "An unexpected error occurred")
