import { Server } from 'socket.io';

import { AudioStreamService } from
  '../modules/voice/audio/audio-stream.service';

export class SocketManager {

  private readonly audioStreamService =
    new AudioStreamService();

  constructor(
    private readonly io: Server,
  ) {}

  public register(): void {

    this.io.on(
      'connection',
      (socket) => {

        console.log(
          'client connected:',
          socket.id,
        );

        const grpcStream =
          this.audioStreamService
            .createStream(
              socket,
              socket.id,
            );

        socket.on(
          'audio:chunk',
          (data: Buffer) => {

            const audioBuffer =
              Buffer.isBuffer(data)
                ? data
                : Buffer.from(data);

            grpcStream.write({

              pcm: audioBuffer,

              session_id: socket.id,

              sample_rate: 16000,

              channels: 1,

              timestamp_ms: Date.now(),
            });
          },
        );

        socket.on(
          'disconnect',
          () => {

            console.log(
              'client disconnected:',
              socket.id,
            );

            grpcStream.end();
          },
        );
      },
    );
  }
}
