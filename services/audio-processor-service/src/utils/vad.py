import webrtcvad
import numpy as np


class SimpleVAD:

    def __init__(self, aggressiveness: int = 2):
        self.vad = webrtcvad.Vad(aggressiveness)

    def is_speech(self, frame: bytes, sample_rate: int) -> bool:
        return self.vad.is_speech(frame, sample_rate)

    def frame_probabilities(
        self,
        audio: np.ndarray,
        sample_rate: int,
    ):

        frame_ms = 20
        frame_size = int(sample_rate * frame_ms / 1000)

        probs = []

        for i in range(0, len(audio), frame_size):

            frame = audio[i:i + frame_size]

            if len(frame) < frame_size:
                continue

            frame = (frame * 32767).astype(np.int16)

            is_speech = self.vad.is_speech(
                frame.tobytes(),
                sample_rate,
            )

            probs.append(1.0 if is_speech else 0.0)

        return probs