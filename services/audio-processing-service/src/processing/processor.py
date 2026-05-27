import numpy as np
import scipy.signal as signal
import logging

from src.utils.silero_vad import SileroVAD

logger = logging.getLogger("audio-processor")


class AudioProcessor:

    def __init__(self, sample_rate: int = 16000, noise_reduce_strength: float = 0.7):
        self.sample_rate = sample_rate
        self.noise_reduce_strength = noise_reduce_strength
        self.vad = SileroVAD()

    def reduce_noise(self, audio: np.ndarray):

        _, _, zxx = signal.stft(audio, nperseg=256)

        magnitude = np.abs(zxx)
        phase = np.angle(zxx)

        noise_floor = np.mean(magnitude, axis=1, keepdims=True)

        mask = magnitude > noise_floor * self.noise_reduce_strength

        cleaned = magnitude * mask

        _, recovered = signal.istft(cleaned * np.exp(1j * phase))

        return recovered[: len(audio)]

    def compute_speech_ratio(self, audio: np.ndarray) -> float:

        try:
            segments = self.vad.get_segments(audio, self.sample_rate)

            if not segments:
                return 0.0

            total = sum(
                s["end"] - s["start"]
                for s in segments
            )

            return float(min(total / max(len(audio), 1), 1.0))

        except Exception as e:
            logger.warning(f"VAD error: {e}")
            return 0.0

    def process(self, audio: np.ndarray):

        if audio is None or len(audio) == 0:
            raise ValueError("empty audio")

        audio = audio.astype(np.float32)

        max_val = np.max(np.abs(audio))
        if max_val > 0:
            audio = audio / max_val

        cleaned = self.reduce_noise(audio)

        speech_ratio = self.compute_speech_ratio(audio)

        return {
            "cleaned_audio": cleaned,
            "speech_ratio": speech_ratio,
            "is_speech": speech_ratio > 0.2,
        }