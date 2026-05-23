import { audioClient } from '../../../core/grpc/audio.client';

export class AudioService {
  processAudio(buffer: Buffer, format = '.webm') {
    return new Promise((resolve, reject) => {
      audioClient.ProcessAudio(
        { audio: buffer, format },
        (err: any, res: any) => {
          if (err) return reject(err);
          resolve(res);
        },
      );
    });
  }
}