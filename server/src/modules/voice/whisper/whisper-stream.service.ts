import { Socket } from 'socket.io';

import { whisperClient } from './whisper.client';

export class WhisperStreamService {
  createStream(socket: Socket) {
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
}