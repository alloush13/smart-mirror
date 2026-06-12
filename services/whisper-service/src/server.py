from concurrent import futures
import os
import grpc

from grpc_health.v1 import health
from grpc_health.v1 import health_pb2
from grpc_health.v1 import health_pb2_grpc

from gen import whisper_pb2_grpc

from src.controllers.whisper_controller import WhisperController
from src.services.whisper_service import WhisperService
from src.core.logger import logger

PORT = int(os.getenv("GRPC_PORT", 50051))
SERVICE_NAME = "voice.Whisper"

def serve():
    whisper_service = WhisperService()
    server = grpc.server(
        futures.ThreadPoolExecutor(max_workers=4),
        options=[
            ("grpc.max_receive_message_length", 10 * 1024 * 1024),
            ("grpc.max_send_message_length", 10 * 1024 * 1024),
        ],
    )

    whisper_pb2_grpc.add_WhisperServicer_to_server(
        WhisperController(whisper_service),
        server,
    )

    health_servicer = health.HealthServicer()
    health_pb2_grpc.add_HealthServicer_to_server(
        health_servicer,
        server,
    )
    server.add_insecure_port(f"0.0.0.0:{PORT}")

    server.start()
    health_servicer.set(
        SERVICE_NAME,
        health_pb2.HealthCheckResponse.SERVING,
    )

    logger.info(f"Whisper service running on :{PORT}")

    server.wait_for_termination()


