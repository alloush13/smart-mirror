import { io, Socket } from "socket.io-client";

import { AUDIO_FRAME_DURATION_MS, AUDIO_SAMPLE_RATE } from "./audioConfig";

import { closeAudioContext, createAudioContext, createChunks, createSessionId, encodePCM } from "./audioUtils";

import type { AudioServiceOptions, AudioServiceState, AudioPacket } from "./types";

export class AudioService {
  private state: AudioServiceState = "idle";

  private socket: Socket | null = null;

  private context: AudioContext | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private worklet: AudioWorkletNode | null = null;
  private stream: MediaStream | null = null;

  private sessionId = createSessionId();
  private sequence = 0;

  private readonly options: AudioServiceOptions;

  constructor(options: AudioServiceOptions = {}) {
    this.options = options;
  }

  async start(): Promise<void> {
    if (this.state === "running" || this.state === "starting") {
      return;
    }

    this.setState("starting");

    try {
      // -------------------------
      // Socket.IO connect
      // -------------------------
      if (!this.socket && this.options.webSocketUrl) {
        this.socket = io(this.options.webSocketUrl, {
          transports: ["websocket"],
        });

        await new Promise<void>((resolve, reject) => {
          this.socket!.on("connect", resolve);
          this.socket!.on("connect_error", reject);
        });
      }

      // -------------------------
      // Microphone
      // -------------------------
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      // -------------------------
      // Audio Context
      // -------------------------
      this.context = createAudioContext(this.sampleRate);

      if (this.context.state === "suspended") {
        await this.context.resume();
      }

      // -------------------------
      // Load AudioWorklet
      // -------------------------
      await this.context.audioWorklet.addModule("/audio-worklet.js");

      this.source = this.context.createMediaStreamSource(this.stream);

      this.worklet = new AudioWorkletNode(this.context, "audio-processor");

      this.source.connect(this.worklet);
      this.worklet.connect(this.context.destination);

      // -------------------------
      // Audio stream handler
      // -------------------------
      this.worklet.port.onmessage = (event) => {
        const input = event.data as Float32Array;

        const pcm = encodePCM(input);

        const chunkSize = (this.sampleRate * this.frameDurationMs) / 1000;

        const chunks = createChunks(pcm, chunkSize);

        for (const chunk of chunks) {
          const packet: AudioPacket = {
            sessionId: this.sessionId,
            sequence: this.sequence++,
            data: chunk.buffer,
          };
          this.options.onPacket?.(packet);

          if (this.socket?.connected) {
            this.socket.emit("audio", packet);
          }
        }
      };

      this.setState("running");
    } catch (error) {
      this.reportError(error);
      await this.stop();
    }
  }

  // -------------------------
  // Controls
  // -------------------------
  pause(): void {
    if (this.state !== "running") return;
    this.setState("paused");
  }

  resume(): void {
    if (this.state !== "paused") return;
    this.setState("running");
  }

  async stop(): Promise<void> {
    this.worklet?.disconnect();
    this.source?.disconnect();

    this.stream?.getTracks().forEach((t) => t.stop());

    await closeAudioContext(this.context);

    this.worklet = null;
    this.source = null;
    this.context = null;
    this.stream = null;

    this.setState("stopped");
  }

  close(): void {
    this.socket?.disconnect();
    this.socket = null;
  }

  resetSession(): void {
    this.sessionId = createSessionId();
    this.sequence = 0;
  }

  // -------------------------
  // State
  // -------------------------
  private setState(state: AudioServiceState): void {
    this.state = state;
    this.options.onStateChange?.(state);
  }

  private reportError(error: unknown): void {
    const normalized = error instanceof Error ? error : new Error(String(error));

    this.options.onError?.(normalized);
  }

  // -------------------------
  // Config getters
  // -------------------------
  private get sampleRate(): number {
    return this.options.sampleRate ?? AUDIO_SAMPLE_RATE;
  }

  private get frameDurationMs(): number {
    return this.options.frameDurationMs ?? AUDIO_FRAME_DURATION_MS;
  }
}
