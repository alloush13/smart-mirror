import * as grpc from '@grpc/grpc-js';
import { WhisperClient } from './whisper-client';

export type WhisperProto = grpc.GrpcObject & {
  voice: grpc.GrpcObject & {
    Whisper: new (
      address: string,
      credentials: grpc.ChannelCredentials,
    ) => WhisperClient;
  };
};
