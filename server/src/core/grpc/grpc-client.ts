import * as grpc from '@grpc/grpc-js';

export function createGrpcClient<T>(
  ClientConstructor: any,
  address: string,
): T {
  return new ClientConstructor(
    address,
    grpc.credentials.createInsecure(),
  );
}