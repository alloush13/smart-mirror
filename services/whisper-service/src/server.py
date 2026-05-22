from concurrent import futures

import grpc

from grpc_health.v1 import health
from grpc_health.v1 import health_pb2
from grpc_health.v1 import health_pb2_grpc

import whisper_pb2_grpc
import whisper_pb2

from src.grpc.whisper_service import (
    WhisperService,
)

from src.core.logger import logger


def serve():
    server = grpc.server(
        futures.ThreadPoolExecutor(
            max_workers=4,
        )
    )

    whisper_pb2_grpc.add_WhisperServiceServicer_to_server(
        WhisperService(),
        server,
    )

    health_servicer = health.HealthServicer()

    health_pb2_grpc.add_HealthServicer_to_server(
        health_servicer,
        server,
    )

    health_servicer.set(
        "voice.WhisperService",
        health_pb2.HealthCheckResponse.SERVING,
    )

    server.add_insecure_port("0.0.0.0:50051")

    server.start()

    logger.info(
        "Whisper gRPC server running on :50051"
    )

    server.wait_for_termination()


if __name__ == "__main__":
    serve()