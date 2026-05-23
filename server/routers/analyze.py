import io
import os

from fastapi import APIRouter, File, Form, HTTPException, Request, UploadFile
from pydantic import ValidationError

from limiter import limiter
from models.schemas import AnalysisResponse
from services.gemini import (
    GeminiConnectionError,
    GeminiParseError,
    analyze_resume_with_gemini,
    test_gemini_connection,
)
from services.parser import extract_text_from_docx, extract_text_from_pdf


PDF_MIME = "application/pdf"
DOCX_MIME = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"

MAX_FILE_SIZE_BYTES = int(os.getenv("MAX_FILE_SIZE_MB", "5")) * 1024 * 1024
MIN_JD_LENGTH = int(os.getenv("MIN_JD_LENGTH", "50"))
MAX_JD_LENGTH = int(os.getenv("MAX_JD_LENGTH", "10000"))

router = APIRouter()


def _validate_file_type(file: UploadFile) -> None:
    name = (file.filename or "").lower()
    mime = file.content_type or ""

    is_pdf = name.endswith(".pdf") and mime == PDF_MIME
    is_docx = name.endswith(".docx") and mime == DOCX_MIME

    if not is_pdf and not is_docx:
        raise HTTPException(
            status_code=422,
            detail={
                "code": "unsupported_file_type",
                "message": "Only PDF (.pdf) and Word (.docx) files are supported.",
            },
        )


@router.get("/health")
async def health_check():
    return {"status": "ok", "version": "1.0.0"}


@router.get("/test-gemini")
async def test_gemini():
    try:
        return test_gemini_connection()
    except GeminiConnectionError as error:
        raise HTTPException(
            status_code=503,
            detail={"code": "ai_service_unavailable", "message": str(error)},
        )


@router.post("/analyze", response_model=AnalysisResponse)
@limiter.limit("10/hour")
async def analyze_resume(
    request: Request,
    file: UploadFile = File(...),
    job_description: str = Form(...),
):
    _validate_file_type(file)

    file_bytes = await file.read()
    if len(file_bytes) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=413,
            detail={
                "code": "file_too_large",
                "message": f"File exceeds {os.getenv('MAX_FILE_SIZE_MB', '5')}MB limit. Try compressing your PDF.",
            },
        )

    jd = job_description.strip()
    if len(jd) < MIN_JD_LENGTH:
        raise HTTPException(
            status_code=422,
            detail={
                "code": "job_description_too_short",
                "message": f"Please paste the full job description (at least {MIN_JD_LENGTH} characters).",
            },
        )
    if len(jd) > MAX_JD_LENGTH:
        raise HTTPException(
            status_code=422,
            detail={
                "code": "job_description_too_long",
                "message": f"Job description exceeds {MAX_JD_LENGTH} character limit.",
            },
        )

    try:
        file_stream = io.BytesIO(file_bytes)
        if file.content_type == PDF_MIME:
            resume_text = extract_text_from_pdf(file_stream)
        else:
            resume_text = extract_text_from_docx(file_stream)
    except Exception:
        raise HTTPException(
            status_code=422,
            detail={
                "code": "empty_resume_text",
                "message": "Couldn't read this file. Try saving it as DOCX or using a text-based PDF.",
            },
        )

    if not resume_text:
        raise HTTPException(
            status_code=422,
            detail={
                "code": "empty_resume_text",
                "message": "Couldn't extract text from this PDF. It may be image-based. Try a DOCX version.",
            },
        )

    try:
        result = analyze_resume_with_gemini(resume_text, jd)
        return AnalysisResponse(**result)
    except GeminiConnectionError:
        raise HTTPException(
            status_code=503,
            detail={
                "code": "ai_service_unavailable",
                "message": "Analysis service temporarily unavailable. Please try again in a moment.",
            },
        )
    except (GeminiParseError, ValidationError):
        raise HTTPException(
            status_code=503,
            detail={
                "code": "ai_service_unavailable",
                "message": "Analysis failed to parse a valid response. Please try again.",
            },
        )
