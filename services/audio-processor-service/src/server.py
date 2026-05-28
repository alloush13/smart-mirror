import asyncio
import os

import grpc

from grpc_health.v1 import (
    health,
    health_pb2,
    health_pb2_grpc,
)

import audio_processor_pb2_grpc

from src.grpc.audio_service import (
    AudioProcessingGrpcService,
)

from src.core.logger import logger

PORT = os.getenv("GRPC_PORT", "50052")


async def serve():

    server = grpc.aio.server(
        options=[
            (
                "grpc.max_send_message_length",
                50 * 1024 * 1024,
            ),
            (
                "grpc.max_receive_message_length",
                50 * 1024 * 1024,
            ),
        ],
    )

    audio_processor_pb2_grpc.add_AudioProcessorServicer_to_server(
        AudioProcessingGrpcService(),
        server,
    )

    health_servicer = health.aio.HealthServicer()

    health_pb2_grpc.add_HealthServicer_to_server(
        health_servicer,
        server,
    )

    await health_servicer.set(
        "audio.AudioProcessor",
        health_pb2.HealthCheckResponse.SERVING,
    )

    server.add_insecure_port(f"0.0.0.0:{PORT}")

    await server.start()

    logger.info(
        f"Audio processor started on 0.0.0.0:{PORT}"
    )

    await server.wait_for_termination()


if __name__ == "__main__":
    asyncio.run(serve())