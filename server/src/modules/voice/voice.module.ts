import { VoiceOrchestrator } from './orchestrator';
import { WhisperService } from './whisper/whisper.service';

class VoiceModule {
  public readonly orchestrator: VoiceOrchestrator;
  public readonly whisper: WhisperService;

  constructor() {
    this.orchestrator = new VoiceOrchestrator();
    this.whisper = new WhisperService();
  }
}

export const voiceModule = new VoiceModule();