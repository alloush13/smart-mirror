import time
from src.processing.session_state import SessionState


class SessionManager:
    def __init__(self, ttl_seconds: int = 300):
        self.sessions: dict[str, SessionState] = {}
        self.last_seen: dict[str, float] = {}
        self.ttl = ttl_seconds

    def get(self, session_id: str) -> SessionState:
        now = time.time()
        self.cleanup(now)

        if session_id not in self.sessions:
            self.sessions[session_id] = SessionState()

        self.last_seen[session_id] = now
        return self.sessions[session_id]

    def cleanup(self, now: float):
        expired = [
            sid for sid, t in self.last_seen.items()
            if now - t > self.ttl
        ]

        for sid in expired:
            self.sessions.pop(sid, None)
            self.last_seen.pop(sid, None)