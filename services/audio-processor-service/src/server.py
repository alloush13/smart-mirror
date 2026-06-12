from concurrent.futures import ThreadPoolExecutor
import os
import grpc
from grpc_health.v1 import health, health_pb2, health_pb2_grpc
import audio_processor_pb2_grpc

from src.core.logger import logger
from src.controllers.audio_processor_controller import AudioProcessingController

PORT = int(os.getenv("GRPC_PORT", 50051))
SERVICE_NAME = "voice.AudioProcessor"


def serve():
    server = grpc.server(ThreadPoolExecutor())

    audio_processor_pb2_grpc.add_AudioProcessorServicer_to_server(
        AudioProcessingController(),
        server,
    )

    health_servicer = health.HealthServicer()
    health_pb2_grpc.add_HealthServicer_to_server(
        health_servicer,
        server,
    )

    server.add_insecure_port(f"0.0.0.0:{PORT}")

    health_servicer.set(
        SERVICE_NAME,
        health_pb2.HealthCheckResponse.NOT_SERVING,
    )
    server.start()
    logger.info(f"Audio processor started on {PORT}")

    health_servicer.set(
        SERVICE_NAME,
        health_pb2.HealthCheckResponse.SERVING,
    )
    
    server.wait_for_termination()
