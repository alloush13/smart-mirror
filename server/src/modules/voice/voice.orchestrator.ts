import { Socket } from 'socket.io';

import { AudioStreamHandler } from './audio/audio-stream.handler';
import { WhisperStreamHandler } from './whisper/whisper-stream.handler';

export class VoiceOrchestrator {
  private readonly audio =
    new AudioStreamHandler();

//   private readonly whisper = new WhisperStreamHandler();

  handleConnection(
    socket: Socket,
  ) {
    const audioStream =
      this.audio.create(
        socket,
        socket.id,
      );

    // let whisperStream =
    //   this.whisper.create(
    //     socket,
    //   );

    socket.on(
      'audio:chunk',
      (data: Buffer) => {
        console.log("chunk received:", data.length);
        const pcm =
          Buffer.isBuffer(data)
            ? data
            : Buffer.from(data);

        this.audio.write(
          audioStream,
          pcm,
          socket.id,
        );
        // this.whisper.write(
        //   whisperStream,
        //   pcm,
        // );
      },
    );

    // socket.on(
    //   'audio:end',
    //   () => {
    //     this.whisper.finish(
    //       whisperStream,
    //     );

    //     whisperStream =
    //       this.whisper.create(
    //         socket,
    //       );
    //   },
    // );

    socket.on(
      'disconnect',
      () => {
        this.audio.close(
          audioStream,
        );

        // this.whisper.close(
        //   whisperStream,
        // );
      },
    );
  }
}