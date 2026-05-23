import os
import logging
import time

from src.processing.processor import AudioProcessor
from src.utils.audio_utils import (
    load_audio,
    save_upload_to_temp,
    save_wav,
)

from src.core.config import SAMPLE_RATE
from src.services.audio_converter_service import AudioConverterService


logger = logging.getLogger("audio-processor-service")


class AudioProcessorService:

    def __init__(self):
        logger.info("AudioProcessorService initialized")

        self.processor = AudioProcessor()
        self.converter = AudioConverterService()

    def process_audio(self, audio_bytes: bytes, suffix: str = ".webm"):

        start_time = time.time()

        input_path = None
        wav_path = None
        output_path = None

        try:

            if not audio_bytes:
                raise ValueError("empty audio request")

            logger.info("Incoming audio | size=%d | suffix=%s", len(audio_bytes), suffix)

            # 1) Save upload
            input_path = save_upload_to_temp(audio_bytes, suffix=suffix)

            # 2) format detection + validation
            suffix = self.converter.detect_format(suffix)

            if not self.converter.is_supported(suffix):
                logger.warning("unsupported format fallback: %s", suffix)
                suffix = ".webm"

            # 3) convert
            wav_path = self.converter.convert_to_wav(input_path, target_sr=SAMPLE_RATE)

            # 4) load audio
            audio, sr = load_audio(wav_path)

            if len(audio) == 0:
                raise RuntimeError("empty decoded audio")

            if sr != SAMPLE_RATE:
                logger.warning("sample rate mismatch fixed by ffmpeg")

            # 5) process
            result = self.processor.process(audio)

            # 6) save output
            output_path = save_wav(result["cleaned_audio"], sample_rate=sr)

            with open(output_path, "rb") as f:
                cleaned_audio = f.read()

            logger.info(
                "DONE | speech_ratio=%.3f | is_speech=%s | time=%.2fs",
                result["speech_ratio"],
                result["is_speech"],
                time.time() - start_time
            )

            return {
                "cleaned_audio": cleaned_audio,
                "speech_ratio": result["speech_ratio"],
                "is_speech": result["is_speech"],
                "sample_rate": sr,
            }

        except Exception as e:
            logger.exception("Audio service failed")

            # fallback safe response
            return {
                "cleaned_audio": b"",
                "speech_ratio": 0.0,
                "is_speech": False,
                "sample_rate": SAMPLE_RATE,
                "error": str(e),
            }

        finally:
            for p in [input_path, wav_path, output_path]:
                try:
                    if p and os.path.exists(p):
                        os.remove(p)
                        logger.info("Cleaned temp: %s", p)
                except Exception:
                    pass