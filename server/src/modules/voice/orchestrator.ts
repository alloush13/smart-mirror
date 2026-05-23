import { audioClient } from '../../core/grpc/audio.client';
import { AudioProcessResult } from './voice.types';

export class VoiceOrchestrator {
  async processAudio(buffer: Buffer, format = '.webm'): Promise<AudioProcessResult> {
    return new Promise((resolve, reject) => {
      audioClient.ProcessAudio(
        {
          audio: buffer,
          format,
        },
        (err: any, res: AudioProcessResult) => {
          if (err) return reject(err);
          resolve(res);
        },
      );
    });
  }
}