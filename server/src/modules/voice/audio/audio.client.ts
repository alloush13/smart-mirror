import * as grpc from '@grpc/grpc-js';
import { loadProto } from '../../../core/grpc/loader';
import { env } from '../../../config/env';
import { AudioProto } from './types/audio-proto';
import { AudioProcessorClient } from './types';

const proto = loadProto<AudioProto>('proto/voice/audio_processor.proto');

export const audioClient: AudioProcessorClient = new proto.voice.AudioProcessor(
  env.AUDIO_PROCESSOR_SERVICE_URL,
  grpc.credentials.createInsecure(),
);
