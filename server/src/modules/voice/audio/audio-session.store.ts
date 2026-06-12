import { AudioSession } from './types';

export class AudioSessionStore {
  private sessions = new Map<string, AudioSession>();

  private get(sessionId: string): AudioSession {
    if (!this.sessions.has(sessionId)) {
      this.sessions.set(sessionId, {
        chunks: [],
        isRecording: false,
      });
    }
    return this.sessions.get(sessionId)!;
  }

  start(sessionId: string) {
    const s = this.get(sessionId);
    s.isRecording = true;
    s.chunks = [];
  }

  push(sessionId: string, chunk: Buffer) {
    const s = this.get(sessionId);
    if (!s.isRecording) return;
    s.chunks.push(chunk);
  }

  stop(sessionId: string): Buffer | null {
    const s = this.get(sessionId);

    if (!s.isRecording) return null;

    const audio = Buffer.concat(s.chunks);

    s.isRecording = false;
    s.chunks = [];

    return audio;
  }
}
