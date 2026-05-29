import numpy as np
from src.utils.vad import SimpleVAD


class AudioProcessor:

    def __init__(self):
        self.vad = SimpleVAD()

    def normalize(self, audio: np.ndarray) -> np.ndarray:
        max_val = np.max(np.abs(audio))

        if max_val > 0:
            audio = audio / max_val

        return audio.astype(np.float32)

    def pcm_to_float32(self, pcm: bytes) -> np.ndarray:
        audio = np.frombuffer(pcm, dtype=np.int16).astype(np.float32)
        return audio / 32768.0

    def float32_to_pcm(self, audio: np.ndarray) -> bytes:
        audio = np.clip(audio, -1.0, 1.0)
        return (audio * 32767).astype(np.int16).tobytes()

    def compute_speech_probability(self, audio: np.ndarray, sample_rate: int) -> float:

        frames = self.vad.frame_probabilities(audio, sample_rate)

        if not frames:
            return 0.0

        return sum(frames) / len(frames)

    def process_chunk(self, pcm: bytes, sample_rate: int):

        audio = self.pcm_to_float32(pcm)
        audio = self.normalize(audio)

        speech_probability = self.compute_speech_probability(
            audio,
            sample_rate,
        )

        return {
            "cleaned_pcm": self.float32_to_pcm(audio),
            "speech_probability": speech_probability,
            "contains_speech": speech_probability > 0.6,
        }
