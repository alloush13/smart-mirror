import { whisperClient } from './whisper.client';
import { TranscribeResponse } from './types';

export class WhisperService {
  transcribe(audio: ArrayBuffer): Promise<TranscribeResponse> {
    return new Promise((resolve, reject) => {
      whisperClient.Transcribe(
        { data: audio },
        (err, response: TranscribeResponse) => {
          if (err) {
            console.log(err);
            return reject(new Error('Whisper gRPC error'));
          }
          resolve(response);
        },
      );
    });
  }
}
