import { Server, Socket } from 'socket.io';
import { whisperClient } from '../modules/voice/whisper/whisper.client';

export class SocketManager {
  constructor(private readonly io: Server) {}

  public register(): void {
    this.io.on('connection', (socket: Socket) => {
      console.log('client connected:', socket.id);

      let stream = whisperClient.StreamTranscribe();

      socket.on('audio:chunk', (data: Buffer) => {
        const audioBuffer = Buffer.isBuffer(data)
          ? data
          : Buffer.from(data);

        stream.write({
          data: audioBuffer,
          sample_rate: 16000,
          sequence: Date.now(),
          language: 'en',
          is_final: false,
          timestamp_ms: Date.now(),
        });
      });

      socket.on('audio:end', () => {
        stream.write({
          data: Buffer.alloc(0),
          sample_rate: 16000,
          sequence: Date.now(),
          language: 'en',
          is_final: true,
          timestamp_ms: Date.now(),
        });

        stream.end();
        stream = whisperClient.StreamTranscribe();
      });

      stream.on('data', (msg: any) => {
        socket.emit('transcript', msg);
      });

      stream.on('error', (err: any) => {
        socket.emit('error', err.message);
      });

      socket.on('disconnect', () => {
        stream.end();
      });
    });
  }
}