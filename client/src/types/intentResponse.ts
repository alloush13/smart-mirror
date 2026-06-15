import { type IntentCommand } from '../intents/intentCommands';
export type IntentResponse = {
    type: string;
    intent: IntentCommand;
    answer: string;
};