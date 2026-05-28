import os
import logging
import subprocess
import tempfile

logger = logging.getLogger("audio-converter")


class AudioConversionError(Exception):
    pass


class AudioConverterService:

    def convert_to_wav(self, input_path: str, target_sr: int = 16000) -> str:

        if not input_path or not os.path.exists(input_path):
            raise AudioConversionError("input file not found")

        output_path = tempfile.NamedTemporaryFile(delete=False, suffix=".wav").name

        cmd = [
            "ffmpeg",
            "-y",
            "-i", input_path,
            "-ar", str(target_sr),
            "-ac", "1",
            "-f", "wav",
            output_path,
        ]

        result = subprocess.run(cmd, capture_output=True, text=True, timeout=60)

        if result.returncode != 0:
            raise AudioConversionError(result.stderr)

        return output_path