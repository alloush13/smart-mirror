import protoLoader from '@grpc/proto-loader';
import grpc from '@grpc/grpc-js';

export class ProtoLoader {
  private cache = new Map<string, grpc.GrpcObject>();

  constructor(
    private defaultOptions: protoLoader.Options = {
      keepCase: true,
      longs: String,
      enums: String,
      defaults: true,
      oneofs: true,
    },
  ) {}

  load(protoPath: string): grpc.GrpcObject {
    let loaded: grpc.GrpcObject | undefined = this.cache.get(protoPath);
    if (loaded) {
      return loaded;
    }

    const packageDefinition = protoLoader.loadSync(
      protoPath,
      this.defaultOptions,
    );

    loaded = grpc.loadPackageDefinition(packageDefinition);

    this.cache.set(protoPath, loaded);

    return loaded;
  }
}
