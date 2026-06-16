import { z } from 'zod';
import { IntentCommands } from './intent-commands';

export const IntentSchema = z.object({
  type: z.enum(['COMMAND', 'QUERY', 'UNKNOWN']),

  intent: z.nativeEnum(IntentCommands),

  answer: z.string(),
});

export type IntentResponse = z.infer<typeof IntentSchema>;
