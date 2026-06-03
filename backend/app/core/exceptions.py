class AppError(Exception):
    def __init__(self, code: str, message: str) -> None:
        self.code = code
        self.message = message
        super().__init__(message)


class NotFoundError(AppError):
    def __init__(self, message: str = "Resource not found") -> None:
        super().__init__("NOT_FOUND", message)


class ValidationError(AppError):
    def __init__(self, message: str = "Validation failed") -> None:
        super().__init__("VALIDATION_ERROR", message)


class ConflictError(AppError):
    def __init__(self, message: str = "Request conflict") -> None:
        super().__init__("CONFLICT", message)
