import numpy as np
import scipy.signal as signal
import logging
import tempfile
import soundfile as sf

from src.utils.silero_vad import SileroVAD

logger = logging.getLogger("audio-processor")


class AudioProcessor:

    def __init__(self, sample_rate: int = 16000, noise_reduce_strength: float = 0.7):
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

        try:
            if audio is None or len(audio) == 0:
                raise ValueError("empty audio")

            audio = audio.astype(np.float32)

            max_val = np.max(np.abs(audio))
            if max_val > 0:
                audio = audio / max_val

            # VAD SAFE MODE
            segments = []

            try:
                tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".wav")
                sf.write(tmp.name, audio, self.sample_rate)

                segments = self.vad.get_segments(audio, self.sample_rate)

            except Exception as vad_error:
                logger.warning("VAD failed safely: %s", vad_error)
                segments = []

            speech_ratio = 0.0

            if segments:
                total_speech = sum(
                    (s.get("end", 0) - s.get("start", 0))
                    for s in segments
                )
                speech_ratio = min(total_speech / max(len(audio), 1), 1.0)

            cleaned = self.reduce_noise(audio)

            return {
                "cleaned_audio": cleaned,
                "speech_ratio": float(speech_ratio),
                "is_speech": speech_ratio > 0.2,
            }

        except Exception as e:
            logger.exception("processor crash recovered")

            return {
                "cleaned_audio": audio if audio is not None else np.array([]),
                "speech_ratio": 0.0,
                "is_speech": False,
                "error": str(e),
            }