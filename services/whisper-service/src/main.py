import os
import shutil
import subprocess
import tempfile

from fastapi import FastAPI, File, HTTPException, UploadFile, status
from faster_whisper import WhisperModel

app = FastAPI(title="Whisper Service")

MODEL_NAME = "small"

model = WhisperModel(
    MODEL_NAME,
    device="cpu",
    compute_type="int8",
)


def cleanup_file(file_path: str | None) -> None:
    if not file_path:
        return

    try:
        os.remove(file_path)
    except FileNotFoundError:
        pass


def convert(input_path: str) -> str:
    if shutil.which("ffmpeg") is None:
        raise RuntimeError("ffmpeg is not installed in the container")

    output_path = tempfile.NamedTemporaryFile(
        suffix=".wav",
        delete=False,
    ).name

    result = subprocess.run(
        [
            "ffmpeg",
            "-y",
            "-i",
            input_path,
            "-ar",
            "16000",
            "-ac",
            "1",
            output_path,
        ],
        capture_output=True,
        text=True,
    )

    if result.returncode != 0:
        cleanup_file(output_path)

        stderr = (result.stderr or result.stdout or "unknown ffmpeg error").strip()
        raise RuntimeError(f"audio conversion failed: {stderr}")

    return output_path


@app.get("/health")
async def health_check():
    return {
        "status": "ok",
        "service": "whisper-service",
        "model": MODEL_NAME,
    }


@app.post("/transcribe")
async def transcribe(file: UploadFile = File(...)):
    if file.filename is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="file is required",
        )

    with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as tmp:
        tmp.write(await file.read())
        input_path = tmp.name

    wav_path = None

    try:
        wav_path = convert(input_path)

        segments, _ = model.transcribe(
            wav_path,
            language="ar",
        )

        text = "".join(segment.text for segment in segments).strip()

        return {"text": text}

    except RuntimeError as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(exc),
        ) from exc

    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"transcription failed: {exc}",
        ) from exc

    finally:
        cleanup_file(input_path)
        cleanup_file(wav_path)