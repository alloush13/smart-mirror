import os
from concurrent import futures
import grpc

from grpc_health.v1 import health, health_pb2, health_pb2_grpc

import audio_processor_pb2_grpc
from src.grpc.audio_service import AudioProcessingGrpcService
from src.core.logger import logger

PORT = os.getenv("GRPC_PORT", "50052")

def serve():

    server = grpc.server(
        futures.ThreadPoolExecutor(max_workers=6),
        options=[
            ("grpc.max_send_message_length", 50 * 1024 * 1024),
            ("grpc.max_receive_message_length", 50 * 1024 * 1024),
        ],
    )

    audio_processor_pb2_grpc.add_AudioProcessingServiceServicer_to_server(
        AudioProcessingGrpcService(),
        server,
    )

    health_servicer = health.HealthServicer()
    health_pb2_grpc.add_HealthServicer_to_server(health_servicer, server)

    health_servicer.set(
        "audio.AudioProcessingService",
        health_pb2.HealthCheckResponse.SERVING,
    )

    server.add_insecure_port(f"0.0.0.0:{PORT}")

    server.start()

    logger.info(f"gRPC server running on 0.0.0.0:{PORT}")

    server.wait_for_termination()


if __name__ == "__main__":
    serve()