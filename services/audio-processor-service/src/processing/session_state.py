from dataclasses import dataclass, field


@dataclass
class SessionState:

    is_speaking: bool = False

    speech_frames: int = 0

    silence_frames: int = 0

    total_frames: int = 0

    speech_detected_frames: int = 0

    utterance_chunks: list[bytes] = field(default_factory=list)

    utterance_started_at: int = 0

    def speech_ratio(self) -> float:

        if self.total_frames == 0:
            return 0.0

        return self.speech_detected_frames / self.total_frames