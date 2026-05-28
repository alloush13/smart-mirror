import torch
import numpy as np


class SileroVAD:

    def __init__(self):

        self.model, utils = torch.hub.load(
            repo_or_dir="snakers4/silero-vad",
            model="silero_vad",
            trust_repo=True,
        )

        self.get_speech_timestamps = utils[0]

    def probability(self, audio: np.ndarray, sample_rate: int) -> float:

        audio = audio.astype("float32")

        timestamps = self.get_speech_timestamps(
            audio,
            self.model,
            sampling_rate=sample_rate,
            return_seconds=False,
        )

        if not timestamps:
            return 0.0

        speech_samples = sum(
            t["end"] - t["start"]
            for t in timestamps
        )

        return min(speech_samples / max(len(audio), 1), 1.0)