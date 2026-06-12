from typing import Optional
import time
from dataclasses import dataclass, field

@dataclass
class SessionState:

    # ======================
    # UTTERANCE STATE
    # ======================
    is_utterance_active: bool = False

    speech_frames: int = 0
    silence_frames: int = 0

    utterance_buffer: list[bytes] = field(default_factory=list)

    # ======================
    # BATCH BUFFER
    # ======================
    chunk_buffer: list[bytes] = field(default_factory=list)

    utterance_started_at: Optional[int] = None
    last_speech_time: Optional[int] = None

    # ======================
    # METADATA
    # ======================
    created_at: float = field(default_factory=time.time)
    last_activity: float = field(default_factory=time.time)

    def update_activity(self):
        self.last_activity = time.time()

    def reset(self):
        self.is_utterance_active = False
        self.speech_frames = 0
        self.silence_frames = 0
        self.utterance_buffer.clear()
        self.chunk_buffer.clear()
        self.utterance_started_at = None
        self.last_speech_time = None