import * as grpc from '@grpc/grpc-js';
import { loadProto } from './loader';

const healthProto = loadProto(
  'proto/common/health.proto',
);

const STATUS_MAP: Record<number, string> = {
  0: 'UNKNOWN',
  1: 'SERVING',
  2: 'NOT_SERVING',
  3: 'SERVICE_UNKNOWN',
};

export async function checkGrpcHealth(
  address: string,
  serviceName: string,
): Promise<string> {
  return new Promise((resolve) => {
    const client =
      new healthProto.grpc.health.v1.Health(
        address,
        grpc.credentials.createInsecure(),
      );

    client.Check(
        {service: serviceName},

      (err: any, res: any) => {
        if (err) {
          return resolve(
            `unreachable: ${err.message}`,
          );
        }
        const status =
  typeof res.status === 'string'
    ? res.status
    : STATUS_MAP[res.status];

        resolve(status ?? 'UNKNOWN');
      },
    );
  });
}