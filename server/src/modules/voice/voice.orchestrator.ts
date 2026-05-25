import { AudioService } from './audio/audio.service';
import { WhisperService } from './whisper/whisper.service';
import { AudioFormatMap } from './audio/audio-format.map';

export class VoiceOrchestrator {
  constructor(
    private readonly audioService = new AudioService(),
    private readonly whisperService = new WhisperService(),
  ) {}

  async process(audio: Buffer, format = '.webm') {
    const formatEnum = AudioFormatMap[format] ?? 0;

    const audioResult = await this.audioService.process(
      audio,
      formatEnum,
    );

    let transcript: any = null;

    if (audioResult.is_speech) {
      transcript = await this.whisperService.transcribe(
        audioResult.cleaned_audio,
      );
    }

    return {
      audio: audioResult,
      transcript,
    };
  }
}