import time
import grpc
import numpy as np

import whisper_pb2
import whisper_pb2_grpc

from src.services.transcriber import transcribe


class Whisper(whisper_pb2_grpc.WhisperServicer):

    def StreamTranscribe(self, request_iterator, context):

        buffer = []
        language = "en"

        start_time = time.time()

        last_sequence = -1

        try:

            for chunk in request_iterator:

                # ترتيب الحزم (important for realtime)
                if chunk.sequence <= last_sequence:
                    continue

                last_sequence = chunk.sequence

                if chunk.language:
                    language = chunk.language

                # PCM16 → float32
                audio = np.frombuffer(chunk.data, dtype=np.int16).astype(np.float32)
                audio = audio / 32768.0

                buffer.append(audio)

                # 🔥 partial update (throttled)
                if len(buffer) % 30 == 0 and not chunk.is_final:

                    partial_audio = np.concatenate(buffer[-30:])  # آخر 30 chunk فقط

                    result = transcribe(partial_audio, language)

                    yield whisper_pb2.Transcript(
                        text=result["text"],
                        is_final=False,
                        confidence=0.6,
                        language=result["language"],
                        processing_time_ms=int((time.time() - start_time) * 1000),
                    )

                # 🔴 END OF UTTERANCE (from VAD)
                if chunk.is_final:

                    full_audio = np.concatenate(buffer)

                    # منع الصوت الصغير جدًا
                    if len(full_audio) < 1600:
                        buffer = []
                        continue

                    result = transcribe(full_audio, language)

                    yield whisper_pb2.Transcript(
                        text=result["text"],
                        is_final=True,
                        confidence=0.9,
                        language=result["language"],
                        processing_time_ms=int((time.time() - start_time) * 1000),
                    )

                    buffer = []
                    start_time = time.time()

        except Exception as e:
            context.set_details(str(e))
            context.set_code(grpc.StatusCode.INTERNAL)
