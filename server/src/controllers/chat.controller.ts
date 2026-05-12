import { Request, Response } from 'express';
import { GeminiService } from '../services/genai.service';

export class ChatController {
  private genai: GeminiService;
  constructor(genai: GeminiService) {
    this.genai = genai;
  }

  async handleChat(req: Request, res: Response) {
    const body = req.body as { text?: unknown } | undefined;
    const text = body?.text;
    if (typeof text !== 'string' || text.length === 0) {
      return res.status(400).json({ error: 'text is required' });
    }

    try {
      const reply = await this.genai.generateChatResponse(text);
      console.log(reply);
      return res.json({ reply });
    } catch (err) {
      console.error('GenAI error', err);
      const isProd = process.env.NODE_ENV === 'production';
      const message = isProd
        ? 'model error'
        : err instanceof Error
          ? err.message
          : String(err);
      return res.status(500).json({ error: message });
    }
  }
}
