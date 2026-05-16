export interface CameraOptions {
  facingMode?: 'user' | 'environment'
  width?: number
  height?: number
  audio?: boolean
}

export async function createCameraStream(
  options: CameraOptions = {}
): Promise<MediaStream> {
  const {
    facingMode = 'user',
    width,
    height,
    audio = false,
  } = options

  return navigator.mediaDevices.getUserMedia({
    video: {
      facingMode,
      width,
      height,
    },
    audio,
  })
}

export function stopCameraStream(
  stream: MediaStream | null
) {
  if (!stream) return

  stream.getTracks().forEach((track) => {
    track.stop()
  })
}

export function attachStreamToVideo(
  video: HTMLVideoElement,
  stream: MediaStream
) {
  video.srcObject = stream
}

export function detachStreamFromVideo(
  video: HTMLVideoElement
) {
  video.srcObject = null
}

export function captureVideoFrame(
  video: HTMLVideoElement,
  quality = 0.92,
) {
  const width = video.videoWidth
  const height = video.videoHeight

  if (!width || !height) {
    return null
  }

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height

  const context = canvas.getContext('2d')
  if (!context) {
    return null
  }

  context.drawImage(video, 0, 0, width, height)

  return canvas.toDataURL('image/jpeg', quality)
}

export async function getVideoDevices() {
  const devices =
    await navigator.mediaDevices.enumerateDevices()

  return devices.filter(
    (device) => device.kind === 'videoinput'
  )
}