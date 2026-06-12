import { AudioStream, AudioStreamEventResponse } from './types';
import { audioClient } from './audio.client';
import { Socket } from 'socket.io';
import { EventEmitter } from 'events';

type SessionBuffer = {
  chunks: Buffer[];
  active: boolean;
};

export class AudioStreamService extends EventEmitter {
  private stream: AudioStream | null = null;

  // 🔥 NEW: session buffers
  private sessions: Map<string, SessionBuffer> = new Map();

  start(session_id: string) {
    this.stream = audioClient.ProcessAudioStream();

    this.stream.on('data', (event: AudioStreamEventResponse) => {
      this.emit('event', event);

      if (event.speech_started) {
        this.handleSpeechStart(session_id);
        this.emit('speech_started', event.speech_started);
      }

      if (event.speech_frame?.cleaned_pcm) {
        this.handleSpeechChunk(session_id, event.speech_frame.cleaned_pcm);
        this.emit('speech_frame', event.speech_frame);
      }

      if (event.speech_ended) {
        const audio = this.handleSpeechEnd(session_id);
        console.log('assssss');
        this.emit('speech_ended', {
          ...event.speech_ended,
          audio, // 🔥 aggregated audio
        });
      }
    });

    this.stream.on('error', (err) => {
      this.emit('error', err);
    });

    this.stream.on('end', () => {
      this.emit('end');
      this.stream = null;
    });
  }

  // =========================
  // SESSION BUFFER LOGIC
  // =========================

  private getSession(sessionId: string): SessionBuffer {
    if (!this.sessions.has(sessionId)) {
      this.sessions.set(sessionId, {
        chunks: [],
        active: false,
      });
    }
    return this.sessions.get(sessionId)!;
  }

  private handleSpeechStart(sessionId: string) {
    const session = this.getSession(sessionId);

    session.active = true;
    session.chunks = [];
  }

  private handleSpeechChunk(sessionId: string, pcm?: Buffer) {
    if (!pcm) return;

    const session = this.getSession(sessionId);

    if (!session.active) return;

    session.chunks.push(pcm);
  }

  private handleSpeechEnd(sessionId: string): Buffer | null {
    const session = this.getSession(sessionId);

    if (!session.active) return null;

    const audio = Buffer.concat(session.chunks);

    session.active = false;
    session.chunks = [];

    return audio;
  }

  // =========================
  // SEND
  // =========================

  sendChunk(pcm: Buffer, sessionId: string): void {
    if (!this.stream) {
      throw new Error('Stream not initialized. Call start() first.');
    }

    if (pcm.length % 2 !== 0) {
      pcm = pcm.subarray(0, pcm.length - 1);
    }

    this.stream.write({
      pcm,
      session_id: sessionId,
      sample_rate: 16000,
      channels: 1,
      timestamp_ms: Date.now(),
    });
  }

  stop(): void {
    if (!this.stream) return;

    this.stream.end();
    this.stream = null;
  }

  // =========================
  // SOCKET HANDLER
  // =========================

  handler(socket: Socket): void {
    this.on('speech_started', (event) => {
      socket.emit('speech_started', event);
    });

    this.on('speech_frame', (event) => {
      socket.emit('speech_frame', event);
    });

    this.on('speech_ended', (event) => {
      socket.emit('speech_ended', event);
    });

    this.on('error', (err) => {
      socket.emit('error', err);
    });

    this.on('end', () => {
      socket.emit('end', null);
    });
  }
}
