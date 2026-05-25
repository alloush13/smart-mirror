import tempfile
import os

import numpy as np
import soundfile as sf


# =========================
# SAVE RAW BYTES TO TEMP FILE
# =========================
def save_upload_to_temp(file_bytes: bytes, suffix: str = ".webm") -> str:
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=suffix)
    tmp.write(file_bytes)
    tmp.close()
    return tmp.name


# =========================
# LOAD AUDIO FROM FILE
# =========================
def load_audio(path: str):
    audio, sr = sf.read(path, dtype="float32")

    # Convert stereo to mono if needed
    if len(audio.shape) > 1:
        audio = np.mean(audio, axis=1)

    return audio, sr


# =========================
# SAVE AUDIO TO WAV FILE
# =========================
def save_wav(audio: np.ndarray, sample_rate: int = 16000) -> str:
    output_path = tempfile.NamedTemporaryFile(delete=False, suffix=".wav").name

    sf.write(output_path, audio, sample_rate)

    return output_path