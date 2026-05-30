import { Socket } from 'socket.io';

import { AudioStreamService } from './audio-stream.service';

export class AudioStreamHandler {
  private readonly service = new AudioStreamService();

  create(socket: Socket,sessionId: string) {
    return this.service.createStream(
      socket,
      sessionId,
    );
  }

  write(stream: any,pcm: Buffer,sessionId: string) {
    stream.write({
      pcm,
      session_id: sessionId,
      sample_rate: 16000,
      channels: 1,
      timestamp_ms: Date.now(),
    });
  }

  close(stream: any) {
    stream.removeAllListeners();
    stream.end();
  }
}