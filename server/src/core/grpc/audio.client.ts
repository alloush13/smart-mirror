import { loadProto } from './loader';
import { createClient } from './grpc-client';
import { env } from '../../config/env';

const proto = loadProto('proto/voice/audio_processor.proto');

const AudioService = proto.audio.AudioProcessingService;

export const audioClient = createClient<any>(
  AudioService,
  env.AUDIO_SERVICE_URL,
);