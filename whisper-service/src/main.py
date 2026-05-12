from fastapi import FastAPI, UploadFile, File
import tempfile
import os
import subprocess
from faster_whisper import WhisperModel

app = FastAPI()

model = WhisperModel(
    "small",
    device="cpu",
    compute_type="int8"
)

def convert(input_path: str) -> str:
    output = tempfile.NamedTemporaryFile(
        suffix=".wav",
        delete=False
    ).name

    subprocess.run(
        [
            "ffmpeg",
            "-y",
            "-i",
            input_path,
            "-ar", "16000",
            "-ac", "1",
            output
        ],
        check=True
    )

    return output


@app.post("/transcribe")
async def transcribe(file: UploadFile = File(...)):
    with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as tmp:
        tmp.write(await file.read())
        input_path = tmp.name

    try:
        wav = convert(input_path)

        segments, _ = model.transcribe(
            wav,
            language="ar"
        )

        text = "".join([s.text for s in segments]).strip()

        return {"text": text}

    finally:
        try:
            os.remove(input_path)
        except:
            pass