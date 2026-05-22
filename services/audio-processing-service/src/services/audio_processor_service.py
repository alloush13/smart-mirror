import os

from src.processing.processor import AudioProcessor
from src.utils.audio_utils import (
    convert_to_wav,
    load_audio,
    save_upload_to_temp,
    save_wav,
)

from src.core.config import SAMPLE_RATE


class AudioProcessorService:
    def __init__(self):
        self.processor = AudioProcessor()

    def process_audio(self, audio_bytes: bytes, suffix: str = ".webm"):
        input_path = None
        wav_path = None
        output_path = None

        try:
            input_path = save_upload_to_temp(audio_bytes, suffix=suffix)

            wav_path = convert_to_wav(input_path)

            audio, sr = load_audio(wav_path)

            if sr != SAMPLE_RATE:
                raise RuntimeError("invalid sample rate")

            result = self.processor.process(audio)

            output_path = save_wav(
                result["cleaned_audio"],
                sample_rate=sr,
            )

            with open(output_path, "rb") as f:
                cleaned_audio = f.read()

            return {
                "cleaned_audio": cleaned_audio,
                "speech_ratio": result["speech_ratio"],
                "is_speech": result["is_speech"],
                "sample_rate": sr,
            }

        finally:
            for path in [input_path, wav_path, output_path]:
                try:
                    if path and os.path.exists(path):
                        os.remove(path)
                except OSError:
                    pass