import { Gemini } from './genai';

export class LLMService {
  private gemini: Gemini;

  constructor() {
    this.gemini = new Gemini();
  }

  async generateResponse(prompt: string, intents: string[]) {
    return await this.gemini.generateChatResponse(prompt, intents);
  }
}
