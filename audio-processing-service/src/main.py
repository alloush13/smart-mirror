import os

from fastapi import FastAPI, UploadFile, File, HTTPException, status

from processor import AudioProcessor
from audio_utils import save_upload_to_temp, convert_to_wav, load_audio


app = FastAPI(title="Audio Processing Service")


def cleanup(path: str | None):
    if path and os.path.exists(path):
        os.remove(path)


@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "audio-processing-service",
    }


@app.post("/process")
async def process(file: UploadFile = File(...)):
    if not file or not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="file is required",
        )

    input_path = None
    wav_path = None

    try:
        file_bytes = await file.read()

        if len(file_bytes) == 0:
            raise HTTPException(
                status_code=400,
                detail="empty file",
            )

        input_path = save_upload_to_temp(file_bytes)

        wav_path = convert_to_wav(input_path)

        audio, sr = load_audio(wav_path)

        processor = AudioProcessor()  # FIX: stateless per request
        result = processor.process(audio)

        return result

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e),
        )

    finally:
        cleanup(input_path)
        cleanup(wav_path)