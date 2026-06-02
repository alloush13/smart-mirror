from grpc_health.v1 import health, health_pb2, health_pb2_grpc

def register_health(server, service_name: str):
    health_servicer = health.HealthServicer()

    health_pb2_grpc.add_HealthServicer_to_server(
        health_servicer,
        server,
    )

    health_servicer.set(
        service_name,
        health_pb2.HealthCheckResponse.SERVING,
    )