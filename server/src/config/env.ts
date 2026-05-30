export const env = {
  PORT: process.env.PORT || 5000,
  AUDIO_PROCESSOR_SERVICE_URL: process.env.AUDIO_PROCESSOR_SERVICE_URL || 'localhost:50051',

  WHISPER_SERVICE_URL: process.env.WHISPER_SERVICE_URL || 'localhost:50052',

};