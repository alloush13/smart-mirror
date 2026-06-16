const ARABIC_LANG = 'ar-SA';
const SPEECH_START_EVENT = 'assistant:speech-start';
const SPEECH_END_EVENT = 'assistant:speech-end';

class SpeechSynthesisService {
  private utteranceId = 0;

  speak(text: string) {
    const cleanText = text.trim();

    if (!cleanText || !('speechSynthesis' in window)) return;

    this.utteranceId += 1;
    const currentUtteranceId = this.utteranceId;

    window.speechSynthesis.cancel();
    window.dispatchEvent(new Event(SPEECH_START_EVENT));

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = ARABIC_LANG;
    utterance.rate = 1;
    utterance.pitch = 1;

    const arabicVoice = window.speechSynthesis
      .getVoices()
      .find((voice) => voice.lang.toLowerCase().startsWith('ar'));

    if (arabicVoice) {
      utterance.voice = arabicVoice;
    }

    const finish = () => {
      if (this.utteranceId === currentUtteranceId) {
        window.dispatchEvent(new Event(SPEECH_END_EVENT));
      }
    };

    utterance.onend = finish;
    utterance.onerror = finish;

    window.speechSynthesis.speak(utterance);
  }

  stop() {
    if ('speechSynthesis' in window) {
      this.utteranceId += 1;
      window.speechSynthesis.cancel();
      window.dispatchEvent(new Event(SPEECH_END_EVENT));
    }
  }
}

export const speechSynthesisService = new SpeechSynthesisService();
