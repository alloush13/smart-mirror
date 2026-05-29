from faster_whisper import WhisperModel
import numpy as np

from src.core.config import MODEL_NAME

model = WhisperModel(
    MODEL_NAME,
    device="cpu",
    compute_type="int8"
)


def transcribe(audio: np.ndarray, language: str):

    audio = audio.astype(np.float32)

    segments, info = model.transcribe(
        audio,
        language=language if language else None,
        vad_filter=False  # مهم: لأنك تستخدم VAD خارجياً
    )

    text = "".join(s.text for s in segments).strip()

    return {
        "text": text,
        "language": info.language
    }