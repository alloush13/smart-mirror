type VADState = {
  isSpeaking: boolean
  energyHistory: number[]
  noiseFloor: number
}

const HISTORY_SIZE = 8

export function createVAD() {
  const state: VADState = {
    isSpeaking: false,
    energyHistory: [],
    noiseFloor: 0.01,
  }

  return {
    /**
     * calibration phase (first seconds)
     */
    calibrateNoise(rms: number) {
      state.noiseFloor =
        state.noiseFloor * 0.9 + rms * 0.1
    },

    /**
     * main detection
     */
    process(rms: number) {
      // smoothing
      state.energyHistory.push(rms)

      if (state.energyHistory.length > HISTORY_SIZE) {
        state.energyHistory.shift()
      }

      const smoothed =
        state.energyHistory.reduce((a, b) => a + b, 0) /
        state.energyHistory.length

      // adaptive thresholds
      const speakThreshold = state.noiseFloor * 3
      const silenceThreshold = state.noiseFloor * 1.8

      if (!state.isSpeaking && smoothed > speakThreshold) {
        state.isSpeaking = true
      }

      if (state.isSpeaking && smoothed < silenceThreshold) {
        state.isSpeaking = false
      }

      return state.isSpeaking
    },

    reset() {
      state.isSpeaking = false
      state.energyHistory = []
    },

    getNoiseFloor() {
      return state.noiseFloor
    },
  }
}