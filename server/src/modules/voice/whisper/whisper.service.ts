import { whisperClient } from '../../../core/grpc/whisper.client';

export class WhisperService {
  async transcribe(audio: Buffer) {
    return new Promise((resolve, reject) => {
      whisperClient.StreamTranscribe(
        {
          data: audio,
          sample_rate: 16000,
          sequence: 0,
          language: 'en',
        },
        (err: any, res: any) => {
          if (err) return reject(err);
          resolve(res);
        },
      );
    });
  }
}