import { loadProto } from './loader';
import { createClient } from './grpc-client';
import { env } from '../../config/env';

const proto = loadProto('proto/voice/whisper.proto');

const WhisperService = proto.voice.WhisperService;

export const whisperClient = createClient<any>(
  WhisperService,
  env.WHISPER_SERVICE_URL,
);