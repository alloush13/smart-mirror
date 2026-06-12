from faster_whisper import WhisperModel
import numpy as np

from src.core.config import MODEL_NAME


model = WhisperModel(
    MODEL_NAME,
    device="cpu",
    compute_type="int8",
)


class WhisperService:

    def __init__(self):
        self.model = model

    def transcribe(self, audio: np.ndarray, language: str | None = None):
        audio = audio.astype(np.float32)

        segments, info = self.model.transcribe(
            audio,
            language=language if language else None,
            vad_filter=False,
        )

        text = "".join(
            segment.text for segment in segments
        ).strip()

        return {
            "text": text,
            "language": info.language,
        }