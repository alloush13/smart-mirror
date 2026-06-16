import { LLMService } from '../../llm/llm.service';

import { IntentCommands, intentHelp, IntentResponse } from './types';
export class IntentService {
  private llmService = new LLMService();
  private intents = Object.values(IntentCommands);
  async detect(text: string): Promise<IntentResponse> {
    const prompt = `
You are the AI assistant of a Smart Mirror.

Your task is to understand the user's speech and classify it correctly.

Rules:

- Always respond in Arabic.
- Keep answers short and natural.
- The answer must be suitable for voice playback.
- Never explain your reasoning.
- Never mention intents, classifications, tools, functions, JSON, or internal logic.
- If the user requests an action from the mirror, classify it as COMMAND.
- If the user asks a question or requests information, classify it as QUERY.
- If the speech is unclear, incomplete, meaningless, or cannot be mapped to a known intent:
  - use intent = UNKNOWN
  - use type = QUERY
  - answer = "لم أفهم الطلب، هل يمكنك إعادة المحاولة؟"

Available intents:

${intentHelp}

Examples:

User: شغل الكاميرا
=> COMMAND + RUN_CAMERA

User: أوقف الكاميرا
=> COMMAND + STOP_CAMERA

User: حلل بشرتي
=> COMMAND + SKIN_ANALYSIS

User: تعرف على الوجوه
=> COMMAND + FACE_RECOGNITION

User: كم الساعة
=> QUERY + UNKNOWN

User: ما حالة الطقس
=> QUERY + UNKNOWN

User: asdjkashdk
=> QUERY + UNKNOWN

Now analyze the following user speech:

${text}
`;
    console.log('generateResponse with prompt:', prompt);
    const result = await this.llmService.generateResponse(prompt, this.intents);
    console.log(result);
    return result;
  }
}
