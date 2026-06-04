from src.processing.processor import AudioProcessor
from src.processing.session_manager import SessionManager
from src.core.config import (
    VAD_THRESHOLD,
    SPEECH_START_FRAMES,
    SPEECH_END_FRAMES,
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

        result = self.processor.process_chunk(
            pcm,
            sample_rate,
        )

        speech_probability = result["speech_probability"]

        state.total_frames += 1
        events = []

        is_speech = speech_probability >= VAD_THRESHOLD

        # =========================
        # SPEECH DETECTED
        # =========================
        if is_speech:

            state.speech_frames += 1
            state.silence_frames = 0
            state.speech_detected_frames += 1

            if state.is_speaking:
                state.utterance_chunks.append(pcm)

            if (
                not state.is_speaking
                and state.speech_frames >= SPEECH_START_FRAMES
            ):
                state.is_speaking = True
                state.utterance_started_at = timestamp_ms

                events.append({
                    "type": "speech_started",
                    "timestamp_ms": timestamp_ms,
                })

        # =========================
        # SILENCE
        # =========================
        else:

            state.silence_frames += 1
            state.speech_frames = 0

            if state.is_speaking:
                state.utterance_chunks.append(pcm)

            if (
                state.is_speaking
                and state.silence_frames >= SPEECH_END_FRAMES
            ):
                state.is_speaking = False

                duration_ms = timestamp_ms - state.utterance_started_at

                events.append({
                    "type": "speech_ended",
                    "timestamp_ms": timestamp_ms,
                    "speech_ratio": state.speech_ratio(),
                    "duration_ms": duration_ms,
                    "utterance_pcm": b"".join(state.utterance_chunks),
                })

                state.reset()

        # =========================
        # FRAME EVENT (always)
        # =========================
        events.append({
            "type": "speech_frame",
            "timestamp_ms": timestamp_ms,
            "cleaned_pcm": result["cleaned_pcm"],
            "speech_probability": speech_probability,
            "speech_ratio": state.speech_ratio(),
            "contains_speech": result["contains_speech"],
        })

        return events