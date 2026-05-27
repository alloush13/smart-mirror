export type AudioServiceState =
  | 'idle'
  | 'starting'
  | 'running'
  | 'paused'
  | 'stopped'
  | 'error'

export interface AudioPacket {
  sessionId: string;
  sequence: number;
  data: ArrayBufferLike;
}

export interface AudioServiceOptions {
  socket?: WebSocket | null
  webSocketUrl?: string

  sampleRate?: number
  frameDurationMs?: number
  processorBufferSize?: number

  onPacket?: (packet: AudioPacket) => void
  onStateChange?: (state: AudioServiceState) => void
  onError?: (error: Error) => void
}