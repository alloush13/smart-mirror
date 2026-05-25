import { whisperClient } from './whisper.client';
import { WhisperTranscript } from './whisper.type';

export class WhisperService {
  async transcribe(audio: Buffer): Promise<WhisperTranscript> {
    return new Promise((resolve, reject) => {
      whisperClient.StreamTranscribe(
        {
          data: audio,
          sample_rate: 16000,
          sequence: 0,
          language: 'en',
        },
        (err: any, res: WhisperTranscript) => {
          if (err) return reject(err);
          resolve(res);
        },
      );
    });
  }
}