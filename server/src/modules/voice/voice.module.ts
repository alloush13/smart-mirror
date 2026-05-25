import { VoiceOrchestrator } from './voice.orchestrator';

class VoiceModule {
  public readonly orchestrator = new VoiceOrchestrator();
}

export const voiceModule = new VoiceModule();