import grpc

import audio_processor_pb2
import audio_processor_pb2_grpc

from src.services.audio_processor_service import AudioProcessorService
from src.core.logger import logger


class AudioProcessingController(
    audio_processor_pb2_grpc.AudioProcessorServicer
):

    def __init__(self):
        self.audio_processor_service = AudioProcessorService()

    def ProcessAudioStream(self, request_iterator, context):

        for request in request_iterator:

            try:
                event = self.audio_processor_service.process_stream_chunk(
                    session_id=request.session_id,
                    pcm=request.pcm,
                    sample_rate=request.sample_rate,
                    timestamp_ms=request.timestamp_ms,
                )

                if event is None:
                    continue

                # =========================
                # SPEECH STARTED
                # =========================
                if event["type"] == "speech_started":

                    yield audio_processor_pb2.AudioStreamEventResponse(
                        speech_started=audio_processor_pb2.SpeechStarted(
                            timestamp_ms=event["timestamp_ms"],
                        )
                    )

                # =========================
                # FINAL RESULT ONLY
                # =========================
                elif event["type"] == "utterance_ready":

                    yield audio_processor_pb2.AudioStreamEventResponse(
                        speech_ended=audio_processor_pb2.SpeechEnded(
                            timestamp_ms=event["timestamp_ms"],
                            duration_ms=0,
                            final_speech_ratio=1.0,
                        )
                    )

            except Exception as e:

                logger.exception("stream error")

                yield audio_processor_pb2.AudioStreamEventResponse(
                    error=audio_processor_pb2.ErrorEvent(
                        message=str(e),
                    )
                )