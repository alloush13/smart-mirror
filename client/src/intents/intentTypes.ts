import type { IntentCommand } from './intentCommands';

export type IntentResponse = {
  type: 'COMMAND' | 'QUERY';
  intent: IntentCommand;
  answer: string;
};