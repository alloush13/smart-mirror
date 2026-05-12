export type Intent =
  | 'mirror.turn_on'
  | 'mirror.turn_off'
  | 'skin.analyze'
  | 'weather.show'
  | 'unknown';

export interface IntentResult {
  intent: Intent;
  confidence: number;
  reply: string;
}
