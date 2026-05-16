import { z } from 'zod';

export const IntentSchema = z.object({
  intent: z.enum([
    'TURN_ON_SCREEN',
    'TURN_OFF_SCREEN',
    'ANALYZE_SKIN',
    'GET_TIME',
  ]),
  reply: z.string(),
});

export type Intent = z.infer<typeof IntentSchema>;
