export function speak(
  text: string,
  onStart?: () => void,
  onEnd?: () => void,
): void {
  // 🛑 stop previous speech
  speechSynthesis.cancel()

  const utterance =
    new SpeechSynthesisUtterance(text)

  // 🌍 Arabic voice
  const voices =
    speechSynthesis.getVoices()

  const arabicVoice = voices.find((voice) =>
    voice.lang.startsWith('ar'),
  )

  if (arabicVoice) {
    utterance.voice = arabicVoice
  }

  utterance.lang = 'ar-SA'

  // 🚀 speed
  utterance.rate = 1.5

  // 🎙 tone
  utterance.pitch = 1

  // 🔊 volume
  utterance.volume = 1

  // ▶️ speaking started
  utterance.onstart = () => {
    console.log('🔊 assistant speaking')

    onStart?.()
  }

  // ⏹ speaking ended
  utterance.onend = () => {
    console.log('✅ assistant finished')

    onEnd?.()
  }

  speechSynthesis.speak(utterance)
}