from concurrent import futures
import grpc

from grpc_health.v1 import health
from grpc_health.v1 import health_pb2
from grpc_health.v1 import health_pb2_grpc

import whisper_pb2_grpc

from src.grpc.whisper_service import Whisper
from src.core.logger import logger


def serve():

    server = grpc.server(
        futures.ThreadPoolExecutor(max_workers=4),
        options=[
            ("grpc.max_receive_message_length", 10 * 1024 * 1024),
            ("grpc.max_send_message_length", 10 * 1024 * 1024),
        ],
    )

    whisper_pb2_grpc.add_WhisperServicer_to_server(
        Whisper(),
        server,
    )

    health_servicer = health.HealthServicer()
    health_pb2_grpc.add_HealthServicer_to_server(
        health_servicer,
        server,
    )

    health_servicer.set(
        "voice.Whisper",
        health_pb2.HealthCheckResponse.SERVING,
    )

    server.add_insecure_port("0.0.0.0:50051")

    server.start()

    logger.info("Whisper service running on :50051")

    server.wait_for_termination()


if __name__ == "__main__":
    serve()
