import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';

const PROTO_PATH = path.join(process.cwd(), 'proto/voice/audio_processor.proto');

const packageDef = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
});

const grpcObj = grpc.loadPackageDefinition(packageDef) as any;

export const audioClient = new grpcObj.audio.AudioProcessingService(
  'audio-processing-service:50052',
  grpc.credentials.createInsecure(),
);