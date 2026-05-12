declare global {
  type BrowserSpeechRecognitionEvent = Event & {
    resultIndex: number
    results: ArrayLike<{
      0: {
        transcript: string
      }
    }>
  }

  type BrowserSpeechRecognitionInstance = {
    lang: string
    continuous: boolean
    interimResults: boolean
    maxAlternatives: number
    onstart: ((this: BrowserSpeechRecognitionInstance, event: Event) => void) | null
    onend: ((this: BrowserSpeechRecognitionInstance, event: Event) => void) | null
    onerror: ((this: BrowserSpeechRecognitionInstance, event: Event) => void) | null
    onresult: ((this: BrowserSpeechRecognitionInstance, event: BrowserSpeechRecognitionEvent) => void) | null
    start: () => void
    stop: () => void
  }

  type BrowserSpeechRecognitionConstructor = new () => BrowserSpeechRecognitionInstance

  interface Window {
    SpeechRecognition?: BrowserSpeechRecognitionConstructor
    webkitSpeechRecognition?: BrowserSpeechRecognitionConstructor
  }
}

export {}