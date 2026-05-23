import { createGrpcClient } from './grpc-client';
import { env } from '../../config/env';

// generated proto
import { AudioProcessingServiceClient } from '../../../proto/voice/audio_processor.proto';

export const audioClient = createGrpcClient<AudioProcessingServiceClient>(
  AudioProcessingServiceClient,
  env.AUDIO_SERVICE_URL,
);