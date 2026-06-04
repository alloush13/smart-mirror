import grpc
from grpc_health.v1 import health, health_pb2_grpc
import audio_processor_pb2_grpc
from src.grpc.audio_service import AudioProcessingGrpcService

SERVICE_NAME = "audio.AudioProcessor"


def create_server():
    server = grpc.aio.server(
        options=[
            ("grpc.max_send_message_length", 50 * 1024 * 1024),
            ("grpc.max_receive_message_length", 50 * 1024 * 1024),
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

    return server, health_servicer