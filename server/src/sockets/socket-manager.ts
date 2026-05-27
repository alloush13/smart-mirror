import { Server, Socket } from 'socket.io';
import { voiceModule } from '../modules/voice/voice.module';

export class SocketManager {
  constructor(private readonly io: Server) {}

  public register(): void {
    this.io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);

      socket.on(
        'audio:chunk',
        async (data: { audio: any; format?: string }) => {
          try {
            // 1. normalize buffer
            const audioBuffer = Buffer.isBuffer(data.audio)
              ? data.audio
              : Buffer.from(data.audio);

            // 2. process FULL FILE ONLY
            const result = await voiceModule.orchestrator.process(
              audioBuffer,
              data.format || '.webm',
            );

            // 3. return audio result
            socket.emit('audio:result', {
              cleaned_audio: result.audio.cleaned_audio,
              speech_ratio: result.audio.speech_ratio,
              is_speech: result.audio.is_speech,
              sample_rate: result.audio.sample_rate,
            });

            // 4. optional transcript
            if (result.transcript?.text) {
              socket.emit('voice:transcript', {
                text: result.transcript.text,
                confidence: result.transcript.confidence,
                language: result.transcript.language,
                is_final: result.transcript.is_final,
              });
            }
          } catch (err: any) {
            console.error('Voice error:', err);

            socket.emit('audio:error', {
              message: err?.message || 'processing failed',
            });
          }
        },
      );

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });
  }
}
