import { z } from 'zod';

/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */

export const IntentEnum = z.enum([
  'mirror.turn_on',
  'mirror.turn_off',
  'skin.analyze',
  'weather.show',
  'unknown',
]);

export const IntentSchema = z.object({
  intent: IntentEnum,
  reply: z.string().min(1),
});

/* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */

export type Intent = z.infer<typeof IntentSchema>;
export type IntentType = z.infer<typeof IntentEnum>;
