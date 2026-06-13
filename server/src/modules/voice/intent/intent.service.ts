export type IntentResult = {
  intent: string;
  entities: Record<string, unknown>;
  confidence: number;
};

export class IntentService {
  async detect(text: string): Promise<IntentResult> {
    // استدعاء LLM هنا

    return {
      intent: 'GET_TIME',
      entities: {},
      confidence: 0.95,
    };
  }
}