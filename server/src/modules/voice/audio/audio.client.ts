import * as grpc from '@grpc/grpc-js';
import { loadProto } from '../../../core/grpc/loader';
import { env } from '../../../config/env';

const proto = loadProto('proto/voice/audio_processor.proto');

const AudioService = proto.audio?.AudioProcessingService;

export const audioClient = new AudioService(
  env.AUDIO_SERVICE_URL,
  grpc.credentials.createInsecure(),
);