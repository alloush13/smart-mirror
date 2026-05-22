import grpc

import audio_processor_pb2
import audio_processor_pb2_grpc

from src.services.audio_processor_service import AudioProcessorService
from src.core.config import MAX_AUDIO_SIZE
from src.core.logger import logger


class AudioProcessingGrpcService(
    audio_processor_pb2_grpc.AudioProcessingServiceServicer
):
    def __init__(self):
        self.service = AudioProcessorService()

    def ProcessAudio(self, request, context):
        try:
            if not request.audio:
                context.abort(
                    grpc.StatusCode.INVALID_ARGUMENT,
                    "audio is required",
                )

            if len(request.audio) > MAX_AUDIO_SIZE:
                context.abort(
                    grpc.StatusCode.INVALID_ARGUMENT,
                    "audio too large",
                )

            result = self.service.process_audio(
                audio_bytes=request.audio,
                suffix=request.format or ".webm",
            )

            return audio_processor_pb2.AudioResponse(
                cleaned_audio=result["cleaned_audio"],
                speech_ratio=result["speech_ratio"],
                is_speech=result["is_speech"],
                sample_rate=result["sample_rate"],
            )

        except Exception as exc:
            logger.exception("grpc error: %s", exc)

            context.abort(
                grpc.StatusCode.INTERNAL,
                "audio processing failed",
            )