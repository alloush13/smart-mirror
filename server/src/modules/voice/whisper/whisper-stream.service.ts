import { Socket } from 'socket.io';

import { whisperClient } from './whisper.client';

export class WhisperStreamService {
  recognizeSpeech(socket: Socket, payload: { audio: ArrayBuffer }) {
    whisperClient.Transcribe(
      {
        data: payload.audio,
      },
      (err, response) => {
        if (err) {
          console.error(err);
          return;
        }

        socket.emit('speech:result', response);
      },
    );
  }
}
