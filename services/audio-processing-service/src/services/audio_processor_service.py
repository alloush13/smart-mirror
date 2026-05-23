import os
import logging
import time

from src.processing.processor import AudioProcessor
from src.utils.audio_utils import (
    convert_to_wav,
    load_audio,
    save_upload_to_temp,
    save_wav,
)

from src.core.config import SAMPLE_RATE


logger = logging.getLogger("audio-processor-service")


class AudioProcessorService:
    def __init__(self):
        logger.info("AudioProcessorService initialized")
        self.processor = AudioProcessor()
        logger.info("AudioProcessor loaded")

    def process_audio(self, audio_bytes: bytes, suffix: str = ".webm"):
        start_time = time.time()

        input_path = None
        wav_path = None
        output_path = None

        try:
            logger.info("Received audio request | size=%d bytes | suffix=%s",
                        len(audio_bytes), suffix)

            # Step 1: Save upload
            t0 = time.time()
            input_path = save_upload_to_temp(audio_bytes, suffix=suffix)
            logger.info("Saved temp file: %s (%.3fs)", input_path, time.time() - t0)

            # Step 2: Convert to wav
            t0 = time.time()
            logger.info("Converting to WAV using ffmpeg...")

            wav_path = convert_to_wav(input_path)

            logger.info("WAV created: %s (%.3fs)", wav_path, time.time() - t0)

            # Step 3: Load audio
            t0 = time.time()
            logger.info("Loading audio file...")

            audio, sr = load_audio(wav_path)

            logger.info(
                "Audio loaded | samples=%d | sample_rate=%d (%.3fs)",
                len(audio),
                sr,
                time.time() - t0,
            )

            if len(audio) == 0:
                raise RuntimeError("empty audio loaded")

            # Step 4: validate sample rate
            if sr != SAMPLE_RATE:
                raise RuntimeError(
                    f"invalid sample rate: {sr}, expected {SAMPLE_RATE}"
                )

            # Step 5: process audio
            t0 = time.time()
            logger.info("Processing audio (VAD + noise reduction)...")

            result = self.processor.process(audio)

            logger.info(
                "Processing done | speech_ratio=%.3f | is_speech=%s (%.3fs)",
                result["speech_ratio"],
                result["is_speech"],
                time.time() - t0,
            )

            # Step 6: save output
            t0 = time.time()
            logger.info("Saving cleaned audio...")

            output_path = save_wav(
                result["cleaned_audio"],
                sample_rate=sr,
            )

            logger.info("Output saved: %s (%.3fs)", output_path, time.time() - t0)

            # Step 7: read result
            with open(output_path, "rb") as f:
                cleaned_audio = f.read()

            logger.info(
                "Request completed successfully in %.3fs",
                time.time() - start_time,
            )

            return {
                "cleaned_audio": cleaned_audio,
                "speech_ratio": result["speech_ratio"],
                "is_speech": result["is_speech"],
                "sample_rate": sr,
            }

        finally:
            # cleanup
            for path in [input_path, wav_path, output_path]:
                try:
                    if path and os.path.exists(path):
                        os.remove(path)
                        logger.info("Cleaned temp file: %s", path)
                except OSError:
                    pass