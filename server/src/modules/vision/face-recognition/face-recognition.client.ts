import * as grpc from '@grpc/grpc-js';
import { loadProto } from '../../../core/grpc/loader';
import { env } from '../../../config/env';

export interface FaceRecognitionClient {
  Recognize(
    request: { image: Buffer },
    callback: (err: Error | null, res: any) => void,
  ): void;
}

type FaceProto = grpc.GrpcObject & {
  vision: grpc.GrpcObject & {
    face: grpc.GrpcObject & {
      FaceRecognition: new (
        address: string,
        credentials: grpc.ChannelCredentials,
      ) => FaceRecognitionClient;
    };
  };
};

const proto = loadProto<FaceProto>('proto/vision/face_recognition.proto');

export const faceRecognitionClient = new proto.vision.face.FaceRecognition(
  env.FACE_RECOGNITION_SERVICE_URL,
  grpc.credentials.createInsecure(),
);
