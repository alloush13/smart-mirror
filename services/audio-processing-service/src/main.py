import logging
import os

from fastapi import FastAPI, UploadFile, File, HTTPException, status
from fastapi.background import BackgroundTask
from fastapi.responses import FileResponse

from processor import AudioProcessor
from audio_utils import (
    save_upload_to_temp,
    convert_to_wav,
    load_audio,
    save_wav,
)

logging.basicConfig(level=logging.INFO)

logger = logging.getLogger(__name__)

app = FastAPI(
    title="Audio Processing Service",
    version="1.0.0",
)

MAX_FILE_SIZE = 20 * 1024 * 1024

ALLOWED_TYPES = {
    "audio/wav",
    "audio/x-wav",
    "audio/mpeg",
    "audio/webm",
    "audio/ogg",
}


def cleanup(path: str | None):
    try:
        if path and os.path.exists(path):
            os.remove(path)
    except OSError:
        pass


@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "audio-processing-service",
    }


@app.post(
    "/process",
    summary="Process audio",
    description="Detect speech and reduce noise",
)
async def process(file: UploadFile = File(...)):
    if not file or not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="file is required",
        )

    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="unsupported audio format",
        )

    input_path = None
    wav_path = None
    output_path = None

    try:
        file_bytes = await file.read()

        if len(file_bytes) == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="empty file",
            )

        if len(file_bytes) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail="file too large",
            )

        input_path = save_upload_to_temp(
            file_bytes,
            suffix=os.path.splitext(file.filename)[1] or ".webm",
        )

        wav_path = convert_to_wav(input_path)

        audio, sr = load_audio(wav_path)

        if len(audio) == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="invalid audio",
            )

        if sr != 16000:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="invalid sample rate",
            )

        processor = AudioProcessor()

        result = processor.process(audio)

        output_path = save_wav(
            result["cleaned_audio"],
            sample_rate=sr,
        )

        response = FileResponse(
            path=output_path,
            media_type="audio/wav",
            filename="processed.wav",
            background=BackgroundTask(
                cleanup,
                output_path,
            ),
        )

        response.headers["X-Speech-Ratio"] = str(
            result["speech_ratio"]
        )

        response.headers["X-Is-Speech"] = str(
            result["is_speech"]
        )

        return response

    except HTTPException:
        raise

    except Exception:
        logger.exception("audio processing failed")

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="audio processing failed",
        )

    finally:
        cleanup(input_path)
        cleanup(wav_path)