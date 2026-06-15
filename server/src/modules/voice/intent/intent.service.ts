import { LLMService } from '../../llm/llm.service';

import { IntentCommands, IntentResponse } from './types';
export class IntentService {
  private llmService = new LLMService();
  private intents = Object.values(IntentCommands);
  async detect(text: string): Promise<IntentResponse> {
    const prompt = `You are an assistant.

You MUST always respond in Arabic.

Rules:
- Always respond in Arabic
- Keep responses clear and short
- If user writes in English, still respond in Arabic
- answer must be short and useful
User:
${text}
`;

    const result = await this.llmService.generateResponse(prompt, this.intents);
    console.log(result);
    return result;
  }
}
