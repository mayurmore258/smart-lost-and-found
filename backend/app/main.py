import logging
from contextlib import asynccontextmanager
from pathlib import Path
from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.config import settings
from app.database.database import init_db
from app.utils.errors import AppException
from app.api.health import router as health_router
from app.api.items import router as items_router
from app.api.matches import router as matches_router
from app.api.verification import router as verification_router

# Setup logging
logging.basicConfig(
    level=logging.INFO if not settings.DEBUG else logging.DEBUG,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger("smart_lost_and_found")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: ensure upload folder and database tables exist
    settings.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    init_db()
    logger.info("Database initialized and upload directory verified.")
    yield
    # Shutdown logic if any
    logger.info("Shutting down Smart AI Lost & Found Backend.")


app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    description="Backend API and AI Reasoning Engine for Smart AI Lost & Found system.",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS configuration allowing teammate frontend connections
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount local uploads directory for image retrieval
settings.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(settings.UPLOAD_DIR)), name="uploads")


# ============================================================
# STANDARDIZED ERROR HANDLERS
# Format: {"error": {"code": "...", "message": "..."}}
# ============================================================
@app.exception_handler(AppException)
async def app_exception_handler(request: Request, exc: AppException):
    return exc.to_response()


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    error_details = []
    for err in exc.errors():
        loc = " -> ".join([str(p) for p in err.get("loc", [])])
        msg = err.get("msg", "Validation error")
        error_details.append(f"{loc}: {msg}")
    combined_message = "; ".join(error_details) if error_details else "Invalid request data."

    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": {
                "code": "VALIDATION_ERROR",
                "message": combined_message,
            }
        },
    )


@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": {
                "code": f"HTTP_{exc.status_code}",
                "message": str(exc.detail),
            }
        },
    )


@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    logger.exception(f"Unhandled server error: {exc}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": {
                "code": "INTERNAL_SERVER_ERROR",
                "message": "An unexpected internal server error occurred.",
            }
        },
    )


# ============================================================
# ROUTER REGISTRATION
# ============================================================
app.include_router(health_router, prefix=settings.API_V1_PREFIX)
app.include_router(items_router, prefix=settings.API_V1_PREFIX)
app.include_router(matches_router, prefix=settings.API_V1_PREFIX)
app.include_router(verification_router, prefix=settings.API_V1_PREFIX)
