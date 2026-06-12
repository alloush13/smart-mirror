import numpy as np

from src.processing.processor import AudioProcessor
from src.processing.session_manager import SessionManager
from src.core.config import (
    BATCH_SIZE,
    VAD_THRESHOLD,
    SPEECH_START_FRAMES,
    SPEECH_END_FRAMES,
    MIN_AMPLITUDE_THRESHOLD,
)


class AudioProcessorService:

    def __init__(self):
        self.processor = AudioProcessor()
        self.sessions = SessionManager()

    def process_stream_chunk(
        self,
        session_id: str,
        pcm: bytes,
        sample_rate: int,
        timestamp_ms: int,
    ):
        state = self.sessions.get(session_id)

        state.update_activity()

        # =========================
        # 1. BUFFER CHUNKS
        # =========================
        state.chunk_buffer.append(pcm)

        if len(state.chunk_buffer) < BATCH_SIZE:
            return None  # مهم جدًا: لا شيء بعد

        merged_pcm = b"".join(state.chunk_buffer)
        state.chunk_buffer.clear()

        # =========================
        # 2. ENERGY CHECK
        # =========================
        audio_np = np.frombuffer(merged_pcm, dtype=np.int16).astype(np.float32)
        mean_abs = np.mean(np.abs(audio_np))

        if mean_abs < MIN_AMPLITUDE_THRESHOLD:
            is_speech = False
        else:
            result = self.processor.process_chunk(merged_pcm, sample_rate)
            is_speech = result["speech_probability"] >= VAD_THRESHOLD

        # =========================
        # 3. SPEECH START
        # =========================
        if is_speech:

            state.speech_frames += 1
            state.silence_frames = 0

            state.last_speech_time = timestamp_ms
            state.utterance_buffer.append(merged_pcm)

            if (
                not state.is_utterance_active
                and state.speech_frames >= SPEECH_START_FRAMES
            ):
                state.is_utterance_active = True
                state.utterance_started_at = timestamp_ms

                return {
                    "type": "speech_started",
                    "timestamp_ms": timestamp_ms,
                }

        # =========================
        # 4. SILENCE + END
        # =========================
        else:
            state.silence_frames += 1
            state.speech_frames = 0

            if state.is_utterance_active:

                state.utterance_buffer.append(merged_pcm)

                if state.silence_frames >= SPEECH_END_FRAMES:

                    utterance = b"".join(state.utterance_buffer)

                    state.reset()

                    return {
                        "type": "utterance_ready",
                        "timestamp_ms": timestamp_ms,
                        "utterance_pcm": utterance,
                    }

        return None