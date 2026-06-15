export const env = {
  PORT: process.env.PORT || 5000,

  // AUDIO_PROCESSOR_SERVICE_URL:
  //   process.env.AUDIO_PROCESSOR_SERVICE_URL || 'localhost:50051',

  WHISPER_SERVICE_URL: process.env.WHISPER_SERVICE_URL || 'localhost:50051',

  SKIN_ANALYSIS_SERVICE_URL:
    process.env.SKIN_ANALYSIS_SERVICE_URL || 'localhost:50053',

  FACE_RECOGNITION_SERVICE_URL:
    process.env.FACE_RECOGNITION_SERVICE_URL || 'localhost:50054',

  AUDIO_SAMPLE_RATE: Number(process.env.AUDIO_SAMPLE_RATE ?? 16000),
  AUDIO_CHANNELS: Number(process.env.AUDIO_CHANNELS ?? 1),

  GEMINI_MODEL: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
};
