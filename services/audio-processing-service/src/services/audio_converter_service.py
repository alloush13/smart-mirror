import os
import logging
import subprocess
import tempfile

logger = logging.getLogger("audio-converter")


class AudioConversionError(Exception):
    pass


class AudioConverterService:

    SUPPORTED_FORMATS = {
        ".webm", ".wav", ".mp3", ".ogg", ".m4a", ".aac"
    }

    def detect_format(self, suffix: str | None):
        return (suffix or ".webm").lower()

    def is_supported(self, suffix: str) -> bool:
        return suffix in self.SUPPORTED_FORMATS

    def convert_to_wav(self, input_path: str, target_sr: int = 16000) -> str:

        if not input_path or not os.path.exists(input_path):
            raise AudioConversionError("input file not found")

        output_path = tempfile.NamedTemporaryFile(delete=False, suffix=".wav").name

        logger.info("FFMPEG convert start | input=%s", input_path)

        cmd = [
            "ffmpeg",
            "-hide_banner",
            "-loglevel", "error",
            "-y",
            "-i", input_path,
            "-ar", str(target_sr),
            "-ac", "1",
            "-f", "wav",
            output_path,
        ]

        try:
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=60
            )

            if result.returncode != 0:
                logger.error("FFMPEG error: %s", result.stderr)
                raise AudioConversionError(result.stderr)

            if not os.path.exists(output_path):
                raise AudioConversionError("ffmpeg output missing")

            logger.info("FFMPEG convert done | output=%s", output_path)

            return output_path

        except subprocess.TimeoutExpired:
            logger.error("FFMPEG timeout")
            raise AudioConversionError("ffmpeg timeout")