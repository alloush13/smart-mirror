const ARABIC_LANG = 'ar-SA';

class SpeechSynthesisService {
  speak(text: string) {
    const cleanText = text.trim();

    if (!cleanText || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();

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

    window.speechSynthesis.speak(utterance);
  }

  stop() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
}

export const speechSynthesisService = new SpeechSynthesisService();
