import os

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from limiter import limiter
from routers import analyze


def _get_allowed_origins():
    production_origin = os.getenv("ALLOWED_ORIGIN", "")
    origins = ["http://localhost:5173", "http://localhost:3000"]
    if production_origin:
        origins.append(production_origin)
    return origins


app = FastAPI(title="RecruitLens API", version="1.0.0")

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_get_allowed_origins(),
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
    allow_credentials=False,
)


@app.exception_handler(Exception)
async def generic_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={
            "detail": {
                "code": "internal_error",
                "message": "An unexpected error occurred.",
            }
        },
    )


app.include_router(analyze.router)
