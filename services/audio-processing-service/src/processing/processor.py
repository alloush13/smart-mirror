import numpy as np
import scipy.signal as signal
import collections

from src.utils.silero_vad import SileroVAD


class AudioProcessor:
    def __init__(
        self,
        sample_rate: int = 16000,
        noise_reduce_strength: float = 0.7,
    ):
        self.sample_rate = sample_rate
        self.noise_reduce_strength = noise_reduce_strength
        self.vad = SileroVAD()

    def build_noise_profile(self, audio: np.ndarray):
        _, _, zxx = signal.stft(audio, nperseg=256)
        return np.mean(np.abs(zxx), axis=1)

    def reduce_noise(self, audio: np.ndarray):
        noise_profile = self.build_noise_profile(audio)

        _, _, zxx = signal.stft(audio, nperseg=256)

        magnitude = np.abs(zxx)
        phase = np.angle(zxx)

        threshold = noise_profile[:, None] * self.noise_reduce_strength

        mask = magnitude > threshold

        cleaned = magnitude * np.where(mask, 1.0, 0.15)

        _, recovered = signal.istft(cleaned * np.exp(1j * phase))

        return recovered[: len(audio)].astype(np.float32)

    def process(self, audio: np.ndarray):
        if len(audio) == 0:
            raise ValueError("empty audio")

        audio = audio.astype(np.float32)

        max_val = np.max(np.abs(audio))
        if max_val > 0:
            audio = audio / max_val

        # حفظ مؤقت لـ Silero
        import tempfile
        import soundfile as sf

        tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".wav")
        sf.write(tmp.name, audio, self.sample_rate)

        segments = self.vad.get_segments(tmp.name, self.sample_rate)

        speech_ratio = 0.0

        if segments:
            total_speech = sum(
                (s["end"] - s["start"]) for s in segments
            )
            speech_ratio = total_speech / len(audio)

        cleaned = self.reduce_noise(audio)

        return {
            "cleaned_audio": cleaned,
            "speech_ratio": float(speech_ratio),
            "is_speech": speech_ratio > 0.2,
        }