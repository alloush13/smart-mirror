import { Socket } from 'socket.io';

import { AudioStreamService } from './audio/audio-stream.service';
import { WhisperStreamService } from './whisper/whisper-stream.service';

export class VoiceGateway {
  private readonly audioService =
    new AudioStreamService();

  private readonly whisperService =
    new WhisperStreamService();

  handleConnection(
    socket: Socket,
  ) {
    const audioStream =
      this.audioService.createStream(
        socket,
        socket.id,
      );

    let whisperStream =
      this.whisperService.createStream(
        socket,
      );

    socket.on(
      'audio:chunk',
      (data: Buffer) => {
        const buffer =
          Buffer.isBuffer(data)
            ? data
            : Buffer.from(data);

        audioStream.write({
          pcm: buffer,
          session_id: socket.id,
          sample_rate: 16000,
          channels: 1,
          timestamp_ms: Date.now(),
        });
      },
    );

    socket.on(
      'audio:end',
      () => {
        audioStream.end();

        whisperStream.end();

        whisperStream =
          this.whisperService.createStream(
            socket,
          );
      },
    );

    socket.on(
      'disconnect',
      () => {
        audioStream.removeAllListeners();
        whisperStream.removeAllListeners();

        audioStream.end();
        whisperStream.end();
      },
    );
  }
}