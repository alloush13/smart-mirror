import grpc
from concurrent import futures

import face_recognition_pb2_grpc

from src.services.face_service import FaceService
from src.core.config import Settings
from src.core.logger import logger
from src.grpc.health import register_health


def serve():
    logger.info("Starting Face Recognition gRPC...")

    server = grpc.server(
        futures.ThreadPoolExecutor(max_workers=10),
        options=[
            ("grpc.max_receive_message_length", 50 * 1024 * 1024),
            ("grpc.max_send_message_length", 50 * 1024 * 1024),
        ],
    )

    face_recognition_pb2_grpc.add_FaceRecognitionServicer_to_server(
        FaceService(),
        server
    )

    # health check
    register_health(server, "vision.FaceRecognition")

    server.add_insecure_port(f"0.0.0.0:{Settings.PORT}")
    server.start()

    logger.info(f"Service running on {Settings.PORT}")

    server.wait_for_termination()


if __name__ == "__main__":
    serve()