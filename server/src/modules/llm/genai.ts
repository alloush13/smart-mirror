import {
  GoogleGenAI,
  FunctionCallingConfigMode,
  FunctionDeclaration,
} from '@google/genai';

import { env } from '../../config/env';
import { IntentResponse, IntentSchema } from '../voice/intent/types';

export class Gemini {
  private ai: GoogleGenAI;

  constructor() {
    const key = env.GEMINI_API_KEY;

    if (!key) {
      throw new Error('Missing GEMINI_API_KEY');
    }

    this.ai = new GoogleGenAI({
      apiKey: key,
    });
  }

  async generateChatResponse(
    prompt: string,
    intents: string[],
  ): Promise<IntentResponse> {
    const detectIntentDeclaration: FunctionDeclaration = {
      name: 'detectIntent',
      description: 'Detect user intent and classify the request.',
      parametersJsonSchema: {
        type: 'object',
        properties: {
          intent: {
            type: 'string',
            enum: intents,
          },
          answer: {
            type: 'string',
            description:
              'Natural spoken response as a voice assistant. Must be human-like, not meta, not describing intent.',
          },
          type: {
            type: 'string',
            enum: ['COMMAND', 'QUERY', 'UNKNOWN'],
          },
        },
        required: ['intent', 'answer', 'type'],
      },
    };

    const response = await this.ai.models.generateContent({
      model: env.GEMINI_MODEL,
      contents: prompt,
      config: {
        toolConfig: {
          functionCallingConfig: {
            mode: FunctionCallingConfigMode.ANY,
            allowedFunctionNames: ['detectIntent'],
          },
        },
        tools: [
          {
            functionDeclarations: [detectIntentDeclaration],
          },
        ],
      },
    });

    const call = response.functionCalls?.[0];

    if (!call?.args) {
      throw new Error('No function call returned from Gemini');
    }

    const parsed = IntentSchema.parse(call.args);
    return parsed;
  }
}
