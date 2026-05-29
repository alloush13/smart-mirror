import torch
import numpy as np

class SileroVAD:
    def __init__(self):
        self.model, self.utils = torch.hub.load(
            repo_or_dir="snakers4/silero-vad",
            model="silero_vad",
            trust_repo=True
        )

        self.get_speech_timestamps = self.utils[0]

    def get_segments(self, audio: np.ndarray, sample_rate: int):
        audio = audio.astype("float32")

        return self.get_speech_timestamps(
            audio,
            self.model,
            sampling_rate=sample_rate,
            return_seconds=False
        )