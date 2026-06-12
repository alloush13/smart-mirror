import * as grpc from '@grpc/grpc-js';
import { loadProto } from './loader';

export enum ServingStatus {
  UNKNOWN = 0,
  SERVING = 1,
  NOT_SERVING = 2,
  SERVICE_UNKNOWN = 3,
}

export interface HealthCheckRequest {
  service: string;
}

export interface HealthCheckResponse {
  status: ServingStatus;
}

export interface HealthClient {
  Check(
    request: HealthCheckRequest,
    callback: (
      error: grpc.ServiceError | null,
      response: HealthCheckResponse,
    ) => void,
  ): void;
}

type HealthProto = grpc.GrpcObject & {
  grpc: grpc.GrpcObject & {
    health: grpc.GrpcObject & {
      v1: grpc.GrpcObject & {
        Health: new (
          address: string,
          credentials: grpc.ChannelCredentials,
        ) => HealthClient;
      };
    };
  };
};

const healthProto = loadProto<HealthProto>('proto/common/health.proto');

export async function checkGrpcHealth(
  address: string,
  serviceName: string,
): Promise<string> {
  return new Promise((resolve) => {
    const client = new healthProto.grpc.health.v1.Health(
      address,
      grpc.credentials.createInsecure(),
    );

    client.Check(
      { service: serviceName },
      (err: grpc.ServiceError | null, res: HealthCheckResponse) => {
        if (err) {
          resolve(`unreachable: ${err.message}`);
          return;
        }
        const status =
          typeof res.status === 'string'
            ? res.status
            : ServingStatus[res.status];

        resolve(status ?? 'UNKNOWN');
      },
    );
  });
}
