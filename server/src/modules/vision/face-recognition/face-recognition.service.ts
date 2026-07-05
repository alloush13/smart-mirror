import { faceRecognitionClient } from './face-recognition.client';
import { Socket } from 'socket.io';
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

  registerFaceHandlers(socket: Socket): void {
    socket.on('face:recognize', async (data: { image: Buffer }) => {
      try {
        console.log('face:recognize');
        const result = await this.recognize(data.image);

        socket.emit('face:result', result);
      } catch (error) {
        console.log(error);
        socket.emit('face:error', {
          message: 'Face recognition failed',
        });
      }
    });
  }
}
