import tempfile

from faster_whisper import WhisperModel

from src.core.config import MODEL_NAME


model = WhisperModel(
    MODEL_NAME,
    device="cpu",
    compute_type="int8",
    download_root="./storage/models/whisper",
)

class WhisperService:

    def __init__(self):
        self.model = model

    def transcribe(
        self,
        audio_bytes: bytes,
        language: str | None = None,
    ):
        with tempfile.NamedTemporaryFile(
            suffix=".webm",
            delete=True,
        ) as audio_file:

            audio_file.write(audio_bytes)
            audio_file.flush()

            segments, info = self.model.transcribe(
                audio_file.name,
                language=language,
                vad_filter=False,
            )

            text = "".join(
                segment.text for segment in segments
            ).strip()

            return {
                "text": text,
                "language": info.language,
            }