import grpc

import audio_processor_pb2
import audio_processor_pb2_grpc

from src.services.audio_processor_service import (
    AudioProcessorService,
)

from src.core.logger import logger


class AudioProcessingGrpcService(
    audio_processor_pb2_grpc.AudioProcessorServicer
):

    def __init__(self):

        self.service = AudioProcessorService()

    async def StreamAudio(self, request_iterator, context):

        async for request in request_iterator:

            try:

                events = self.service.process_stream_chunk(
                    session_id=request.session_id,
                    pcm=request.pcm,
                    sample_rate=request.sample_rate,
                    timestamp_ms=request.timestamp_ms,
                )

                for event in events:

                    if event["type"] == "speech_started":

                        yield audio_processor_pb2.AudioStreamEvent(
                            speech_started=
                            audio_processor_pb2.SpeechStarted(
                                timestamp_ms=event[
                                    "timestamp_ms"
                                ]
                            )
                        )

                    elif event["type"] == "speech_frame":

                        yield audio_processor_pb2.AudioStreamEvent(
                            speech_frame=
                            audio_processor_pb2.SpeechFrame(
                                cleaned_pcm=event[
                                    "cleaned_pcm"
                                ],
                                speech_probability=event[
                                    "speech_probability"
                                ],
                                speech_ratio=event[
                                    "speech_ratio"
                                ],
                                contains_speech=event[
                                    "contains_speech"
                                ],
                                timestamp_ms=event[
                                    "timestamp_ms"
                                ],
                            )
                        )

                    elif event["type"] == "speech_ended":

                        yield audio_processor_pb2.AudioStreamEvent(
                            speech_ended=
                            audio_processor_pb2.SpeechEnded(
                                timestamp_ms=event[
                                    "timestamp_ms"
                                ],
                                final_speech_ratio=event[
                                    "speech_ratio"
                                ],
                                duration_ms=event[
                                    "duration_ms"
                                ],
                            )
                        )

            except Exception as e:

                logger.exception(e)

                yield audio_processor_pb2.AudioStreamEvent(
                    error=audio_processor_pb2.ErrorEvent(
                        message=str(e)
                    )
                )