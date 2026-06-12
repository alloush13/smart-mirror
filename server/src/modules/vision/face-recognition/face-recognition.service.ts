import { faceRecognitionClient } from './face-recognition.client';

export interface RecognizeResponse {
  predictions: {
    name: string;
    confidence: number;
  }[];
}

export class FaceRecognitionService {
  recognize(image: Buffer): Promise<RecognizeResponse> {
    return new Promise((resolve, reject) => {
      faceRecognitionClient.Recognize({ image }, (err, res) => {
        if (err) return reject(err);
        resolve(res);
      });
    });
  }
}
