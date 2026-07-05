const SPEECH_START_EVENT = "assistant:speech-start";
const SPEECH_END_EVENT = "assistant:speech-end";

class SpeechSynthesisService {
  private queue: string[] = [];
  private speaking = false;

  speak(text: string) {
    const clean = text?.trim();
    if (!clean) return;

    this.queue.push(clean);

    if (this.speaking) return;

    this.processQueue();
  }

  private processQueue() {
    if (!this.queue.length) {
      this.speaking = false;
      window.dispatchEvent(new Event(SPEECH_END_EVENT));
      return;
    }

    const text = this.queue.shift()!;
    this.speaking = true;

    if (!("speechSynthesis" in window)) return;

    const utterance = new SpeechSynthesisUtterance(text);

    utterance.lang = "ar-SA";
    utterance.rate = 1;
    utterance.pitch = 1;

    const voices = window.speechSynthesis.getVoices();
    const arabicVoice = voices.find(v => v.lang.toLowerCase().includes("ar"));

    if (arabicVoice) {
      utterance.voice = arabicVoice;
    }

    window.dispatchEvent(new Event(SPEECH_START_EVENT));

    utterance.onend = () => {
      this.speaking = false;
      this.processQueue();
    };

    utterance.onerror = () => {
      this.speaking = false;
      this.processQueue();
    };

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }

  stop() {
    this.queue = [];
    this.speaking = false;
    window.speechSynthesis.cancel();
    window.dispatchEvent(new Event(SPEECH_END_EVENT));
  }
}

export const speechSynthesisService = new SpeechSynthesisService();