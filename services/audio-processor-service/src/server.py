import asyncio
import signal
import os
from grpc_health.v1 import health_pb2
from src.grpc.server import create_server
from src.core.logger import logger

PORT = int(os.getenv("GRPC_PORT", 50051))
SERVICE_NAME = "audio.AudioProcessor"


async def serve():
    server, health_servicer = create_server()

    server.add_insecure_port(f"0.0.0.0:{PORT}")

    await health_servicer.set(
        SERVICE_NAME,
        health_pb2.HealthCheckResponse.SERVING,
    )

    stop_event = asyncio.Event()

    def _stop(*_):
        stop_event.set()

    signal.signal(signal.SIGINT, _stop)
    signal.signal(signal.SIGTERM, _stop)

    await server.start()
    logger.info(f"Audio processor started on {PORT}")

    await stop_event.wait()

    await health_servicer.set(
        SERVICE_NAME,
        health_pb2.HealthCheckResponse.NOT_SERVING,
    )

    await server.stop(5)


if __name__ == "__main__":
    asyncio.run(serve())