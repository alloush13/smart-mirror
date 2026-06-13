import { whisperClient } from './whisper.client';
import { TranscribeResponse } from './types';

export class WhisperStreamService {
  transcribe(audio: Buffer): Promise<TranscribeResponse> {
    return new Promise((resolve, reject) => {
      whisperClient.Transcribe(
        { data: audio },
        (err, response) => {
          if (err) return reject(err);
          resolve(response);
        },
      );
    });
  }
}