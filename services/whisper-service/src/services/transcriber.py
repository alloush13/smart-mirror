from faster_whisper import WhisperModel

from src.core.config import MODEL_NAME


model = WhisperModel(
    MODEL_NAME,
    device="cpu",
    compute_type="int8",
)


def transcribe_audio(
    wav_path: str,
    language: str,
):
    segments, info = model.transcribe(
        wav_path,
        language=language,
    )

    text = "".join(
        segment.text for segment in segments
    ).strip()

    return {
        "text": text,
        "language": info.language,
    }