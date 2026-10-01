from fastapi import HTTPException, status
from fastapi.responses import JSONResponse


class AppException(HTTPException):
    """Base application exception returning standardized error format."""
    def __init__(self, code: str, message: str, status_code: int = status.HTTP_400_BAD_REQUEST):
        super().__init__(status_code=status_code, detail=message)
        self.code = code
        self.message = message

    def to_response(self) -> JSONResponse:
        return JSONResponse(
            status_code=self.status_code,
            content={
                "error": {
                    "code": self.code,
                    "message": self.message
                }
            }
        )


class ItemNotFoundException(AppException):
    def __init__(self, item_id: str):
        super().__init__(
            code="ITEM_NOT_FOUND",
            message=f"Item with id '{item_id}' not found.",
            status_code=status.HTTP_404_NOT_FOUND
        )


class MatchNotFoundException(AppException):
    def __init__(self, match_id: str):
        super().__init__(
            code="MATCH_NOT_FOUND",
            message=f"Match with id '{match_id}' not found.",
            status_code=status.HTTP_404_NOT_FOUND
        )


class InvalidImageException(AppException):
    def __init__(self, message: str = "Invalid image file format or size."):
        super().__init__(
            code="INVALID_IMAGE",
            message=message,
            status_code=status.HTTP_400_BAD_REQUEST
        )


class InvalidStatusException(AppException):
    def __init__(self, status_val: str, allowed: list[str]):
        super().__init__(
            code="INVALID_STATUS",
            message=f"Invalid status '{status_val}'. Allowed values are: {', '.join(allowed)}.",
            status_code=status.HTTP_400_BAD_REQUEST
        )


class AIProviderUnavailableException(AppException):
    def __init__(self, message: str = "All configured AI providers are currently unavailable."):
        super().__init__(
            code="AI_PROVIDER_UNAVAILABLE",
            message=message,
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE
        )


class AIStageFailedException(AppException):
    def __init__(self, stage: str, message: str):
        super().__init__(
            code="AI_STAGE_FAILED",
            message=f"AI stage '{stage}' failed: {message}",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


class ValidationErrorException(AppException):
    def __init__(self, message: str):
        super().__init__(
            code="VALIDATION_ERROR",
            message=message,
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY
        )
