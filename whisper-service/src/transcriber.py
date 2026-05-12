import subprocess
import tempfile
from faster_whisper import WhisperModel

model = WhisperModel(
    "small",
    device="cpu",
    compute_type="int8"
)

def convert_to_wav(input_path: str) -> str:
    output_path = tempfile.NamedTemporaryFile(
        suffix=".wav",
        delete=False
    ).name

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
            output_path
        ],
        check=True
    )

    return output_path


def transcribe_audio(input_path: str) -> str:
    wav_path = convert_to_wav(input_path)

    segments, _ = model.transcribe(
        wav_path,
        language="ar"
    )

    text = "".join([s.text for s in segments]).strip()

    return text