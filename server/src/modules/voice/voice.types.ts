export type AudioSession = {
  chunks: Buffer[];
  format: string;
  lastUpdate: number;
};
export type AudioProcessResult = {
  cleaned_audio: Buffer;
  speech_ratio: number;
  is_speech: boolean;
  sample_rate: number;
  format?: string;
};