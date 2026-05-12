import { GoogleGenAI } from '@google/genai';
import { type Intent, IntentSchema } from '../intents/intent.schema';

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    const key = process.env.GEMINI_API_KEY;
    if (!key) throw new Error('Missing GEMINI_API_KEY');

    this.ai = new GoogleGenAI({ apiKey: key });
  }

  async generateChatResponse(text: string): Promise<string> {
    const prompt = `User: ${text}\nAssistant:`;
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      return response.text ?? '';
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      // graceful fallback for known location restriction errors
      if (
        msg.includes('User location is not supported') ||
        msg.includes('FAILED_PRECONDITION')
      ) {
        console.warn('GenAI location restriction, returning fallback reply');
        return 'آسف، لا أستطيع الوصول إلى خدمة الذكاء الاصطناعي الآن.';
      }
      throw new Error(`genai.generateChatResponse failed: ${msg}`, {
        cause: err,
      });
    }
  }

  async getIntent(text: string): Promise<Intent> {
    const prompt = `
You are a smart mirror brain.

Return ONLY JSON:

{
  "intent": "mirror.turn_on | mirror.turn_off | skin.analyze | weather.show",
  "reply": "short Arabic response"
}

User input:
${text}
`;

    const res = await this.ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const raw = res.text ?? '{}';
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const parsed = JSON.parse(raw);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    return IntentSchema.parse(parsed);
  }
}
