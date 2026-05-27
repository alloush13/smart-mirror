import numpy as np

from src.processing.processor import AudioProcessor


class AudioProcessorService:

    def __init__(self):
        self.processor = AudioProcessor()

    def process_audio_file(self, audio_bytes: bytes):

        audio = np.frombuffer(audio_bytes, dtype=np.int16).astype(np.float32)

        result = self.processor.process(audio)

        cleaned = result["cleaned_audio"].astype(np.int16).tobytes()

        return {
            "cleaned_audio": cleaned,
            "speech_ratio": result["speech_ratio"],
            "contains_speech": result["is_speech"],
            "sample_rate": 16000,
        }

    def process_stream_chunk(self, chunk: bytes, chunk_index: int):

        # PCM decode (IMPORTANT FIX)
        audio = np.frombuffer(chunk, dtype=np.int16).astype(np.float32)

        result = self.processor.process(audio)

        processed = result["cleaned_audio"].astype(np.int16).tobytes()

        return {
            "processed_chunk": processed,
            "contains_speech": result["is_speech"],
            "confidence": 0.8,
        }