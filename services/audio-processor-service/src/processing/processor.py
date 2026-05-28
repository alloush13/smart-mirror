import numpy as np

from src.utils.silero_vad import SileroVAD


class AudioProcessor:

    def __init__(self):

        self.vad = SileroVAD()

    def normalize(self, audio: np.ndarray) -> np.ndarray:

        max_val = np.max(np.abs(audio))

        if max_val > 0:
            audio = audio / max_val

        return audio.astype(np.float32)

    def pcm_to_float32(self, pcm: bytes) -> np.ndarray:

        audio = np.frombuffer(pcm, dtype=np.int16)

        audio = audio.astype(np.float32)

        audio = audio / 32768.0

        return audio

    def float32_to_pcm(self, audio: np.ndarray) -> bytes:

        audio = np.clip(audio, -1.0, 1.0)

        audio = (audio * 32767).astype(np.int16)

        return audio.tobytes()

    def process_chunk(self, pcm: bytes, sample_rate: int):

        audio = self.pcm_to_float32(pcm)

        audio = self.normalize(audio)

        speech_probability = self.vad.probability(
            audio,
            sample_rate,
        )

        return {
            "cleaned_pcm": self.float32_to_pcm(audio),
            "speech_probability": speech_probability,
            "contains_speech": speech_probability > 0.6,
        }