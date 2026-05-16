import numpy as np
import webrtcvad
import collections
import scipy.signal as signal


class AudioProcessor:
    def __init__(
        self,
        sample_rate: int = 16000,
        frame_ms: int = 30,
        vad_mode: int = 2,
        smoothing_window: int = 7,
        noise_reduce_strength: float = 0.7,
        min_speech_ratio: float = 0.6,
    ):
        self.sample_rate = sample_rate
        self.frame_ms = frame_ms
        self.vad = webrtcvad.Vad(vad_mode)

        self.frame_size = int(sample_rate * frame_ms / 1000)

        self.smoothing_window = smoothing_window
        self.noise_reduce_strength = noise_reduce_strength
        self.min_speech_ratio = min_speech_ratio

    # -------------------------
    def _frame_generator(self, audio: np.ndarray):
        for i in range(0, len(audio), self.frame_size):
            frame = audio[i:i + self.frame_size]

            # pad last frame instead of dropping it
            if len(frame) < self.frame_size:
                frame = np.pad(frame, (0, self.frame_size - len(frame)))

            yield frame

    # -------------------------
    def _is_speech(self, frame: np.ndarray):
        frame = np.clip(frame, -1.0, 1.0)

        frame_int16 = (frame * 32767).astype(np.int16)
        return self.vad.is_speech(frame_int16.tobytes(), self.sample_rate)

    # -------------------------
    def _smooth_decision(self, buffer, decision: bool):
        buffer.append(1 if decision else 0)
        return (sum(buffer) / len(buffer)) > 0.5

    # -------------------------
    def build_noise_profile(self, audio: np.ndarray):
        f, t, zxx = signal.stft(audio, nperseg=256)
        return np.mean(np.abs(zxx), axis=1)

    # -------------------------
    def reduce_noise(self, audio: np.ndarray):
        noise_profile = self.build_noise_profile(audio)

        f, t, zxx = signal.stft(audio, nperseg=256)

        magnitude = np.abs(zxx)
        phase = np.angle(zxx)

        threshold = noise_profile[:, None] * self.noise_reduce_strength
        mask = magnitude > threshold

        cleaned = magnitude * mask

        _, recovered = signal.istft(cleaned * np.exp(1j * phase))

        return recovered.astype(np.float32)

    # -------------------------
    def process(self, audio: np.ndarray):
        audio = audio.astype(np.float32)

        max_val = np.max(np.abs(audio))
        if max_val > 0:
            audio = audio / max_val

        buffer = collections.deque(maxlen=self.smoothing_window)

        speech_frames = 0
        total_frames = 0

        for frame in self._frame_generator(audio):
            raw = self._is_speech(frame)
            smooth = self._smooth_decision(buffer, raw)

            total_frames += 1
            if smooth:
                speech_frames += 1

        speech_ratio = speech_frames / max(total_frames, 1)

        cleaned = self.reduce_noise(audio)

        return {
            "audio": cleaned.tolist(),  # FIX: JSON serializable
            "speech_ratio": float(speech_ratio),
            "is_speech": speech_ratio > 0.2,
        }