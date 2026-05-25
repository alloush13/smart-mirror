import os
import numpy as np

from src.processing.processor import AudioProcessor
from src.services.audio_converter_service import AudioConverterService
from src.utils.file_utils import save_upload_to_temp, load_audio, save_wav


class AudioProcessorService:

    def __init__(self):
        self.processor = AudioProcessor()
        self.converter = AudioConverterService()

    def process_audio_file(self, audio_bytes: bytes):

        input_path = save_upload_to_temp(audio_bytes)

        wav_path = self.converter.convert_to_wav(input_path)

        audio, sr = load_audio(wav_path)

        result = self.processor.process(audio)

        output_path = save_wav(result["cleaned_audio"], sr)

        with open(output_path, "rb") as f:
            cleaned_audio = f.read()

        return {
            "cleaned_audio": cleaned_audio,
            "speech_ratio": result["speech_ratio"],
            "contains_speech": result["is_speech"],
            "sample_rate": sr,
        }

    def process_stream_chunk(self, chunk: bytes, chunk_index: int):

        audio, sr = load_audio(chunk)

        result = self.processor.process(audio)

        return {
            "processed_chunk": result["cleaned_audio"],
            "contains_speech": result["is_speech"],
            "confidence": 0.8,
        }