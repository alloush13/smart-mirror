export function calculateRMS(data: Uint8Array) {
  let sum = 0

  for (let i = 0; i < data.length; i++) {
    const n = (data[i] - 128) / 128
    sum += n * n
  }

  return Math.sqrt(sum / data.length)
}

export function isSpeech(
  rms: number,
  threshold: number,
) {
  return rms > threshold
}