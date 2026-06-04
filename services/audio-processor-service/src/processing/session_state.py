from dataclasses import dataclass, field
from typing import Optional
import time


@dataclass
class SessionState:

    # ======================
    # SPEECH STATE
    # ======================
    is_speaking: bool = False

    speech_frames: int = 0
    silence_frames: int = 0
    total_frames: int = 0
    speech_detected_frames: int = 0

    utterance_chunks: list[bytes] = field(default_factory=list)

    utterance_started_at: Optional[int] = None

    # ======================
    # METADATA
    # ======================
    created_at: float = field(default_factory=time.time)
    last_activity: float = field(default_factory=time.time)

    # ======================
    # CONFIG LIMITS
    # ======================
    max_chunks: int = 500  # prevent memory explosion

    # ======================
    # METHODS
    # ======================

    def update_activity(self):
        self.last_activity = time.time()

    def add_chunk(self, pcm: bytes):
        if len(self.utterance_chunks) >= self.max_chunks:
            self.utterance_chunks.pop(0)  # drop oldest chunk

        self.utterance_chunks.append(pcm)

    def reset(self):
        self.is_speaking = False
        self.speech_frames = 0
        self.silence_frames = 0
        self.total_frames = 0
        self.speech_detected_frames = 0
        self.utterance_chunks.clear()
        self.utterance_started_at = None

    def speech_ratio(self) -> float:
        if self.total_frames == 0:
            return 0.0
        return self.speech_detected_frames / self.total_frames

    def utterance_duration(self, current_ts: int) -> Optional[int]:
        if self.utterance_started_at is None:
            return None
        return current_ts - self.utterance_started_at