import os
import shutil
import subprocess
import tempfile


def cleanup_file(path: str | None):
    if path and os.path.exists(path):
        os.remove(path)


def convert_to_wav(input_path: str) -> str:
    if shutil.which("ffmpeg") is None:
        raise RuntimeError("ffmpeg is not installed")

    output_path = tempfile.NamedTemporaryFile(
        suffix=".wav",
        delete=False,
    ).name

    result = subprocess.run(
        [
            "ffmpeg",
            "-y",
            "-i",
            input_path,
            "-ar",
            "16000",
            "-ac",
            "1",
            output_path,
        ],
        capture_output=True,
        text=True,
    )

    if result.returncode != 0:
        cleanup_file(output_path)

        raise RuntimeError(
            result.stderr or "ffmpeg conversion failed"
        )

    return output_path