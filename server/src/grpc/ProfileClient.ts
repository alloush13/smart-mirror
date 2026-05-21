import { ProtoLoader } from './proto-loader';
import { GrpcClientFactory } from './grpc-client-factory';

type ProfileServiceCtor = new (address: string, credentials: any) => any;

export class ProfileClient {
  public client: any;

  constructor(
    private protoLoader: ProtoLoader,
    private factory: GrpcClientFactory,
    protoPath: string,
    serviceAddress: string,
  ) {
    const loaded = this.protoLoader.load(protoPath);

    const profile = loaded.profile;

    if (!profile) {
      throw new Error('Profile package not found');
    }

    const ProfileService = profile.ProfileService;

    if (typeof ProfileService !== 'function') {
      throw new Error('ProfileService not found');
    }

    this.client = this.factory.create(
      ProfileService as ProfileServiceCtor,
      serviceAddress,
    );
  }
}
