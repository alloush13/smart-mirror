import { Socket } from 'socket.io';

import { audioClient } from './audio.client';

export class AudioStreamService {
  createStream(socket: Socket, sessionId: string) {
    const grpcStream = audioClient.StreamAudio();

    grpcStream.on('data', (event: any) => {
      if (event.speech_started) {
        console.log(event);
        socket.emit('speech:started', {
          timestamp: event.speech_started.timestamp_ms,
        });
      }

      if (event.speech_frame) {
        socket.emit('speech:frame', {
          probability: event.speech_frame.speech_probability,

          ratio: event.speech_frame.speech_ratio,

          containsSpeech: event.speech_frame.contains_speech,
        });
      }

      if (event.speech_ended) {
        socket.emit('speech:ended', {
          speechRatio: event.speech_ended.final_speech_ratio,

          durationMs: event.speech_ended.duration_ms,
        });
      }

      if (event.error) {
        socket.emit('speech:error', {
          message: event.error.message,
        });
      }
    });

    grpcStream.on('error', (err: Error) => {
      socket.emit('speech:error', {
        message: err.message,
      });
    });

    grpcStream.on('end', () => {
      console.log('gRPC stream ended');
    });

    return grpcStream;
  }
}
