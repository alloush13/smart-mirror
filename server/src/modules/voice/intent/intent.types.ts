export type IntentResult = {
  intent: string;
  entities: Record<string, unknown>;
};

export interface IntentHandler {
  name: string;

  execute(entities: Record<string, unknown>): Promise<unknown>;
}
