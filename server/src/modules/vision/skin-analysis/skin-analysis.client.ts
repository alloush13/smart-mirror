import * as grpc from '@grpc/grpc-js';

import { loadProto } from '../../../core/grpc/loader';

import { env } from '../../../config/env';

const proto = loadProto(
  'proto/vision/skin_analysis.proto',
);

export const skinAnalysisClient =
  new proto.skin.SkinAnalysis(
    env.SKIN_ANALYSIS_SERVICE_URL,
    grpc.credentials.createInsecure(),
  );
