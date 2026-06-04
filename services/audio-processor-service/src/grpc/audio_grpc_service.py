import asyncio
import audio_processor_pb2 as pb2
import audio_processor_pb2_grpc

from src.services.audio_processor_service import AudioProcessorService
from src.core.logger import logger


SERVICE_NAME = "audio.AudioProcessor"


class AudioProcessingGrpcService(
    audio_processor_pb2_grpc.AudioProcessorServicer
):

    def __init__(self):
        self.service = AudioProcessorService()

    async def StreamAudio(self, request_iterator, context):

        try:
            async for request in request_iterator:

                # business logic layer
                events = self.service.process_stream_chunk(
                    session_id=request.session_id,
                    pcm=request.pcm,
                    sample_rate=request.sample_rate,
                    timestamp_ms=request.timestamp_ms,
                )

                for event in events:
                    yield self._map_event(event)

        except asyncio.CancelledError:
            logger.info("Client cancelled stream")
            return

        except Exception as e:
            logger.exception("StreamAudio error")

            yield pb2.AudioStreamEvent(
                error=pb2.ErrorEvent(message=str(e))
            )

    def _map_event(self, event: dict):

        etype = event.get("type")

        if etype == "speech_started":
            return pb2.AudioStreamEvent(
                speech_started=pb2.SpeechStarted(
                    timestamp_ms=event["timestamp_ms"]
                )
            )

        if etype == "speech_frame":
            return pb2.AudioStreamEvent(
                speech_frame=pb2.SpeechFrame(
                    cleaned_pcm=event["cleaned_pcm"],
                    speech_probability=event["speech_probability"],
                    speech_ratio=event["speech_ratio"],
                    contains_speech=event["contains_speech"],
                    timestamp_ms=event["timestamp_ms"],
                )
            )

        if etype == "speech_ended":
            return pb2.AudioStreamEvent(
                speech_ended=pb2.SpeechEnded(
                    timestamp_ms=event["timestamp_ms"],
                    final_speech_ratio=event["speech_ratio"],
                    duration_ms=event["duration_ms"],
                )
            )

        return pb2.AudioStreamEvent(
            error=pb2.ErrorEvent(
                message=f"Unknown event type: {etype}"
            )
        )