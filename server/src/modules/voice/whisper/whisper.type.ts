export type WhisperTranscript = {
  text: string;
  is_final: boolean;
  confidence: number;
  start_time: number;
  end_time: number;
  language: string;
  processing_time_ms: number;
};