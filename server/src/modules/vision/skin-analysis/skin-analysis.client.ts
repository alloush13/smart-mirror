import * as grpc from '@grpc/grpc-js';
import { loadProto } from '../../../core/grpc/loader';
import { env } from '../../../config/env';

export interface SkinAnalysisClient {
  Analyze(
    request: {
      image: Buffer;
      conf?: number;
      iou?: number;
    },
    callback: (err: Error | null, res: any) => void,
  ): void;
}
type SkinProto = grpc.GrpcObject & {
  vision: grpc.GrpcObject & {
    SkinAnalysis: new (
      address: string,
      credentials: grpc.ChannelCredentials,
    ) => SkinAnalysisClient;
  };
};
const proto = loadProto<SkinProto>('proto/vision/skin_analysis.proto');
export const skinAnalysisClient = new proto.vision.SkinAnalysis(
  env.SKIN_ANALYSIS_SERVICE_URL,
  grpc.credentials.createInsecure(),
);
