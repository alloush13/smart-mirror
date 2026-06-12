export interface AudioStreamRequest {
  pcm: Buffer;
  session_id: string;
  sample_rate: number;
  channels: number;
  timestamp_ms: number;
}
