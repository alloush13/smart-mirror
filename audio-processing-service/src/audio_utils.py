import tempfile
import subprocess
import numpy as np
import soundfile as sf


def save_upload_to_temp(file_bytes: bytes, suffix=".webm") -> str:
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=suffix)
    tmp.write(file_bytes)
    tmp.close()
    return tmp.name


def convert_to_wav(input_path: str) -> str:
    output_path = tempfile.NamedTemporaryFile(delete=False, suffix=".wav").name

    subprocess.run(
        [
            "ffmpeg",
            "-y",
            "-i", input_path,
            "-ar", "16000",
            "-ac", "1",
            "-f", "wav",
            output_path,
        ],
        check=True,
        capture_output=True,
    )

    return output_path


def load_audio(path: str):
    audio, sr = sf.read(path, dtype="float32")

    # force mono if stereo
    if len(audio.shape) > 1:
        audio = np.mean(audio, axis=1)

    return audio, sr