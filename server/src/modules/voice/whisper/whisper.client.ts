import * as grpc from '@grpc/grpc-js';

import { loadProto } from '../../../core/grpc/loader';
import { env } from '../../../config/env';

const proto = loadProto(
  'proto/voice/whisper.proto',
);

export const whisperClient =
  new proto.voice.WhisperService(
    env.WHISPER_SERVICE_URL,
    grpc.credentials.createInsecure(),
  );