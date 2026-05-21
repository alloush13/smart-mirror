import grpc from '@grpc/grpc-js';

export class GrpcClientFactory {
  constructor(
    private defaultCredentials: grpc.ChannelCredentials = grpc.credentials.createInsecure(),
  ) {}

  create<T>(
    ClientCtor: new (
      address: string,
      credentials: grpc.ChannelCredentials,
    ) => T,
    address: string,
  ): T {
    return new ClientCtor(address, this.defaultCredentials);
  }
}
