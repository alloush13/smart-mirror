import grpc

import audio_processor_pb2
import audio_processor_pb2_grpc

from src.services.audio_processor_service import AudioProcessorService
from src.core.logger import logger


class AudioProcessingGrpcService(
    audio_processor_pb2_grpc.AudioProcessingServiceServicer
):

    def __init__(self):
        self.service = AudioProcessorService()

    def ProcessAudioFile(self, request, context):

        if not request.audio_data:
            context.abort(grpc.StatusCode.INVALID_ARGUMENT, "audio required")

        try:
            result = self.service.process_audio_file(request.audio_data)

            return audio_processor_pb2.AudioFileResult(
                cleaned_audio=result["cleaned_audio"],
                speech_ratio=result["speech_ratio"],
                contains_speech=result["contains_speech"],
                sample_rate=result["sample_rate"],
            )

        except Exception as e:
            logger.exception(e)
            context.abort(grpc.StatusCode.INTERNAL, "processing failed")

    def StreamAudioProcessing(self, request_iterator, context):

        for request in request_iterator:

            try:
                result = self.service.process_stream_chunk(
                    chunk=request.audio_chunk,
                    chunk_index=request.chunk_index,
                )

                yield audio_processor_pb2.AudioStreamEvent(
                    chunk_result=audio_processor_pb2.AudioChunkResult(
                        processed_audio_chunk=result["processed_chunk"],
                        chunk_index=request.chunk_index,
                        contains_speech=result["contains_speech"],
                        confidence_score=result["confidence"],
                    )
                )

            except Exception as e:
                logger.exception(e)
                continue