import { z } from 'zod'

export const IntentSchema = z.object({
  intent: z.string(),
  reply: z.string(),
})

export type Intent = z.infer<
  typeof IntentSchema
>