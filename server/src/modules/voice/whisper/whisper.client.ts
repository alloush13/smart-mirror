import * as grpc from '@grpc/grpc-js';
import { loadProto } from '../../../core/grpc/loader';
import { env } from '../../../config/env';
import { WhisperClient, WhisperProto } from './types';

const proto = loadProto<WhisperProto>('proto/voice/whisper.proto');

export const whisperClient: WhisperClient = new proto.voice.Whisper(
  env.WHISPER_SERVICE_URL,
  grpc.credentials.createInsecure(),
);
