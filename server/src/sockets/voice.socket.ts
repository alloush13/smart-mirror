import { Server } from 'socket.io';
import { WhisperService } from '../services/whisper.service';
// import { GeminiService } from '../services/genai.service';

const buffers = new Map<string, Buffer[]>();

export function registerVoiceSocket(io: Server): void {
  const whisper = new WhisperService();
  //   const gemini = new GeminiService();

  io.on('connection', (socket) => {
    console.log('client connected');

    buffers.set(socket.id, []);

    socket.on('audio-chunk', (chunk: ArrayBuffer) => {
      const current = buffers.get(socket.id) ?? [];
      current.push(Buffer.from(chunk));
      buffers.set(socket.id, current);
    });

    const interval = setInterval(() => {
      void (async () => {
        const chunks = buffers.get(socket.id);
        if (!chunks?.length) return;

        const audioBuffer = Buffer.concat(chunks);
        buffers.set(socket.id, []);

        try {
          // 1. Whisper
          const text = await whisper.transcribe(audioBuffer);
          if (!text) return;

          socket.emit('transcript', { text });
          console.log(text);

          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          //   const intent = await gemini.getIntent(text);

          // 3. Emit response
          socket.emit('ai-response', text);
        } catch (error) {
          console.error('Error processing audio:', error);
          socket.emit('error', { message: 'Error processing audio' });
        }
      })();
    }, 4000);

    socket.on('disconnect', () => {
      buffers.delete(socket.id);
      clearInterval(interval);
    });
  });
}
