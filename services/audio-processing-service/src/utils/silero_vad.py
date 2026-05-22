import torch

class SileroVAD:
    def __init__(self, threshold: float = 0.5):
        self.threshold = threshold

        self.model, self.utils = torch.hub.load(
            repo_or_dir="snakers4/silero-vad",
            model="silero_vad",
            force_reload=False,
        )

        (
            self.get_speech_timestamps,
            self.save_audio,
            self.read_audio,
            _,
            _,
        ) = self.utils

    def is_speech(self, audio_path: str, sample_rate: int = 16000):
        wav = self.read_audio(audio_path, sampling_rate=sample_rate)

        timestamps = self.get_speech_timestamps(
            wav,
            self.model,
            sampling_rate=sample_rate,
        )

        return len(timestamps) > 0

    def get_segments(self, audio_path: str, sample_rate: int = 16000):
        wav = self.read_audio(audio_path, sampling_rate=sample_rate)

        return self.get_speech_timestamps(
            wav,
            self.model,
            sampling_rate=sample_rate,
        )