import { audioClient } from './audio.client';
import { AudioProcessResult } from '../voice.types';

export class AudioService {
  async process(buffer: Buffer, format: number = 1): Promise<AudioProcessResult> {
    return new Promise((resolve, reject) => {
      audioClient.ProcessAudioFile(
        {
          audio_data: buffer,
          format,
          session_id: '',
        },
        (err: any, res: AudioProcessResult) => {
          if (err) return reject(err);
          console.log(res);
          resolve(res);
        },
      );
    });
  }
}