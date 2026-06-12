import * as grpc from '@grpc/grpc-js';
import { AudioProcessorClient } from './audio-processor-client';

export type AudioProto = grpc.GrpcObject & {
  voice: grpc.GrpcObject & {
    AudioProcessor: new (
      address: string,
      credentials: grpc.ChannelCredentials,
    ) => AudioProcessorClient;
  };
};
