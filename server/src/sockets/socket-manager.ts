import { Server, Socket } from 'socket.io';
import { voiceModule } from '../modules/voice/voice.module';
import { AudioSession, AudioProcessResult } from '../modules/voice/voice.types'
import { WhisperTranscript } from '../modules/voice/whisper/whisper.type'
export class SocketManager {
  constructor(private readonly io: Server) {}

  private sessions: Map<string, AudioSession> = new Map();

  public register(): void {
    this.io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);

      this.registerVoice(socket);

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
        this.sessions.delete(socket.id);
      });
    });
  }

  private registerVoice(socket: Socket) {
    socket.on(
      'audio:chunk',
      async (data: { audio: Buffer; format?: string; final?: boolean }) => {
        try {
          if (!this.sessions.has(socket.id)) {
            this.sessions.set(socket.id, {
              chunks: [],
              format: data.format || '.webm',
              lastUpdate: Date.now(),
            });
          }

          const session = this.sessions.get(socket.id)!;

          session.chunks.push(Buffer.from(data.audio));
          session.lastUpdate = Date.now();

          if (!data.final) return;

          const fullAudio = Buffer.concat(session.chunks);

          session.chunks = [];

          // 1. Audio processing
          const audioResult = await voiceModule.orchestrator.processAudio(
            fullAudio,
            session.format,
          ) as AudioProcessResult;

          socket.emit('audio:result', audioResult);

          if (audioResult.is_speech) {
            const textResult = await voiceModule.whisper.transcribe(fullAudio) as WhisperTranscript;

            socket.emit('voice:transcript', {
              text: textResult.text,
              confidence: textResult.confidence,
              language: textResult.language,
            });
          }

        } catch (err: any) {
          console.error('Voice error:', err);

          socket.emit('audio:error', {
            message: err.message || 'processing failed',
          });
        }
      },
    );
  }
}