import { Socket } from 'socket.io';

import { whisperClient } from './whisper.client';

export class WhisperStreamHandler {
  create(socket: Socket) {
    const stream =
      whisperClient.StreamTranscribe();

    stream.on(
      'data',
      (transcript: any) => {
        socket.emit(
          'transcript',
          transcript,
        );
      },
    );

    stream.on(
      'error',
      (err: Error) => {
        socket.emit(
          'speech:error',
          {
            message: err.message,
          },
        );
      },
    );

    return stream;
  }

  write(
    stream: any,
    audio: Buffer,
  ) {
    stream.write({
      data: audio,
      sample_rate: 16000,
      sequence: Date.now(),
      language: 'en',
      is_final: false,
      timestamp_ms: Date.now(),
    });
  }

  finish(stream: any) {
    stream.write({
      data: Buffer.alloc(0),
      sample_rate: 16000,
      sequence: Date.now(),
      language: 'en',
      is_final: true,
      timestamp_ms: Date.now(),
    });

    stream.end();
  }

  close(stream: any) {
    stream.removeAllListeners();
    stream.end();
  }
}