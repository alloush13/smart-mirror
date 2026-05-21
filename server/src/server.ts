import grpc from '@grpc/grpc-js';
import protoLoader from '@grpc/proto-loader';

type ProfileServiceCtor = new (
  address: string,
  credentials: grpc.ChannelCredentials,
) => grpc.Client;

export default class GRPCServer extends grpc.Server {
  private PROTO_PATH = 'protos/profile.proto';

  private packageDefinition = protoLoader.loadSync(this.PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
  });

  private loaded: grpc.GrpcObject;
  private profileProto: Record<string, unknown>;
  public client: grpc.Client;

  constructor() {
    super();

    // Load proto safely
    this.loaded = grpc.loadPackageDefinition(this.packageDefinition);

    const profile = this.loaded.profile as unknown;

    if (!profile || typeof profile !== 'object') {
      throw new Error('Profile package not found in proto');
    }

    this.profileProto = profile as Record<string, unknown>;

    const ProfileService = this.profileProto['ProfileService'];

    if (typeof ProfileService !== 'function') {
      throw new Error('ProfileService not found or invalid');
    }

    const target = process.env.GRPC_SERVER ?? 'localhost:50051';

    this.client = new (ProfileService as ProfileServiceCtor)(
      target,
      grpc.credentials.createInsecure(),
    );
  }

  public start(port: string | number = 50051) {
    this.bindAsync(
      `0.0.0.0:${port}`,
      grpc.ServerCredentials.createInsecure(),
      () => {
        this.start();
      },
    );
  }
}
