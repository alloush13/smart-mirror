import { z } from 'zod';
import { IntentCommands } from './intent-commands';

export const IntentSchema = z.object({
  type: z.enum(['COMMAND', 'QUERY']),

  intent: z.enum(Object.values(IntentCommands) as [string, ...string[]]),

  answer: z.string(),
});

export type IntentResponse = z.infer<typeof IntentSchema>;
