export enum IntentCommands {
  RUN_CAMERA = 'RUN_CAMERA',
  STOP_CAMERA = 'STOP_CAMERA',

  FACE_RECOGNITION = 'FACE_RECOGNITION',

  SKIN_ANALYSIS = 'SKIN_ANALYSIS',

  NONE = 'NONE',
  UNKNOWN = 'UNKNOWN',
}
const intentDescriptions = {
  RUN_CAMERA: 'تشغيل الكاميرا',
  STOP_CAMERA: 'إيقاف الكاميرا',
  FACE_RECOGNITION: 'التعرف على الوجوه',
  SKIN_ANALYSIS: 'تحليل البشرة',
  UNKNOWN: 'طلب غير معروف',
};

export const intentHelp = Object.entries(intentDescriptions)
  .map(([key, value]) => `${key}: ${value}`)
  .join('\n');
