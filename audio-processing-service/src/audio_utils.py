import subprocess
import tempfile

import numpy as np
import soundfile as sf


def save_upload_to_temp(
    file_bytes: bytes,
    suffix=".webm",
) -> str:
    tmp = tempfile.NamedTemporaryFile(
        delete=False,
        suffix=suffix,
    )

    tmp.write(file_bytes)
    tmp.close()

    return tmp.name


def convert_to_wav(input_path: str) -> str:
    output_path = tempfile.NamedTemporaryFile(
        delete=False,
        suffix=".wav",
    ).name

    try:
        subprocess.run(
            [
                "ffmpeg",
                "-y",
                "-i",
                input_path,
                "-ar",
                "16000",
                "-ac",
                "1",
                "-f",
                "wav",
                output_path,
            ],
            check=True,
            capture_output=True,
            timeout=30,
        )

    except subprocess.CalledProcessError as e:
        raise RuntimeError(
            e.stderr.decode(errors="ignore")
        )

    except subprocess.TimeoutExpired:
        raise RuntimeError(
            "ffmpeg processing timeout"
        )

    return output_path


def load_audio(path: str):
    audio, sr = sf.read(
        path,
        dtype="float32",
    )

    if len(audio.shape) > 1:
        audio = np.mean(audio, axis=1)

    return audio, sr


def save_wav(
    audio: np.ndarray,
    sample_rate: int = 16000,
) -> str:
    output_path = tempfile.NamedTemporaryFile(
        delete=False,
        suffix=".wav",
    ).name

    sf.write(
        output_path,
        audio,
        sample_rate,
    )

    return output_path