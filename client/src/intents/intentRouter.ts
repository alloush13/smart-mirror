import { IntentCommands } from "./intentCommands";
import type { IntentResponse } from "./intentTypes";

type IntentActions = {
  openCamera: () => Promise<void>;
  closeCamera: () => Promise<void>;
};

type IntentHandler = (
  intent: IntentResponse,
  actions: IntentActions,
) => void | Promise<void>;

const handlers: Record<string, IntentHandler> = {
  [IntentCommands.RUN_CAMERA]: async (_intent, actions) => {
    await actions.openCamera();
    console.log("📷 Camera started from voice command");
  },
  [IntentCommands.STOP_CAMERA]: async (_intent, actions) => {
    await actions.closeCamera();
    console.log("📷 Camera stopped from voice command");
  },

  [IntentCommands.FACE_RECOGNITION]: () => {
    console.log("😀 Face recognition started");
  },

  [IntentCommands.SKIN_ANALYSIS]: () => {
    console.log("🧴 Skin analysis started");
  },
};

export function executeIntent(intent: IntentResponse, actions: IntentActions) {
  const handler = handlers[intent.intent];

  if (!handler) {
    console.warn("Unknown intent:", intent.intent);
    return;
  }

  void Promise.resolve(handler(intent, actions)).catch((error) => {
    console.error("Intent execution failed:", error);
  });
}
