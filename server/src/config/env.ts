export const env = {
  PORT: process.env.PORT || 5000,

  AUDIO_SERVICE_URL: process.env.AUDIO_SERVICE_URL || 'localhost:50052',
  WHISPER_SERVICE_URL: process.env.WHISPER_SERVICE_URL || 'localhost:50053',

  NODE_ENV: process.env.NODE_ENV || 'development',
};