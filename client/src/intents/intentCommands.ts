export const IntentCommands = {
  RUN_CAMERA: 'RUN_CAMERA',
  STOP_CAMERA: 'STOP_CAMERA',
  FACE_RECOGNITION: 'FACE_RECOGNITION',
  SKIN_ANALYSIS: 'SKIN_ANALYSIS',
} as const;

export type IntentCommand =
  (typeof IntentCommands)[keyof typeof IntentCommands];