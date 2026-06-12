export interface AudioStreamEventResponse {
  speech_started?: { timestamp_ms: number };
  speech_frame?: {
    cleaned_pcm: Buffer;
    speech_probability: number;
    speech_ratio: number;
    contains_speech: boolean;
    timestamp_ms: number;
  };
  speech_ended?: {
    timestamp_ms: number;
    final_speech_ratio: number;
    duration_ms: number;
  };
  error?: { message: string };
}
