export function createRecorder(
  stream: MediaStream,
  onData: (chunk: Blob) => void,
) {
  const recorder = new MediaRecorder(stream, {
    mimeType: 'audio/webm',
  })

  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) {
      onData(e.data)
    }
  }

  return recorder
}