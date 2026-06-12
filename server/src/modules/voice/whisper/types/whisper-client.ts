export type TranscribeRequest = {
  data: ArrayBuffer;
};

export type TranscribeResponse = {
  text: string;
};

export interface WhisperClient {
  Transcribe(request, callback);
}
