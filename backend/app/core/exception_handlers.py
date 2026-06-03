import logging

from fastapi import Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from sqlalchemy.exc import IntegrityError, SQLAlchemyError

from app.core.exceptions import AppError
from app.schemas.common import ErrorDetail, ErrorEnvelope, ErrorResponse

logger = logging.getLogger(__name__)


def _error_response(
    status_code: int,
    code: str,
    message: str,
    details: list[ErrorDetail] | None = None,
) -> JSONResponse:
    payload = ErrorEnvelope(
        error=ErrorResponse(code=code, message=message, details=details)
    )
    return JSONResponse(status_code=status_code, content=payload.model_dump(exclude_none=True))


def _format_validation_field(location: tuple[str | int, ...]) -> str:
    parts = [str(item) for item in location if item not in {"body", "query"}]
    return ".".join(parts) if parts else "request"


async def app_error_handler(_: Request, exc: AppError) -> JSONResponse:
    status_code_map = {
        "NOT_FOUND": 404,
        "VALIDATION_ERROR": 422,
        "CONFLICT": 409,
    }
    status_code = status_code_map.get(exc.code, 500)

    if status_code >= 500:
        logger.exception("Application error: %s", exc.message)
    else:
        logger.info("Handled application error: %s - %s", exc.code, exc.message)

    return _error_response(status_code, exc.code, exc.message)


async def validation_error_handler(
    _: Request,
    exc: RequestValidationError,
) -> JSONResponse:
    details = [
        ErrorDetail(
            field=_format_validation_field(error.get("loc", ())),
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


async def integrity_error_handler(_: Request, exc: IntegrityError) -> JSONResponse:
    logger.warning("Database integrity error", exc_info=exc)
    return _error_response(
        409,
        "CONFLICT",
        "The request conflicts with existing data or database constraints",
    )


async def sqlalchemy_error_handler(_: Request, exc: SQLAlchemyError) -> JSONResponse:
    logger.exception("Database error")
    return _error_response(500, "INTERNAL_ERROR", "An unexpected error occurred")


async def unhandled_error_handler(_: Request, exc: Exception) -> JSONResponse:
    logger.exception("Unhandled application error")
    return _error_response(500, "INTERNAL_ERROR", "An unexpected error occurred")
