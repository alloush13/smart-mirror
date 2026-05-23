import * as grpc from '@grpc/grpc-js';

export function createClient<T>(
  Client: any,
  url: string,
): T {
  return new Client(
    url,
    grpc.credentials.createInsecure(),
  );
}