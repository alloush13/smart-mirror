import { useCallback, useEffect, useRef, useState } from 'react'

import {
  attachStreamToVideo,
  createCameraStream,
  detachStreamFromVideo,
  stopCameraStream,
} from '../services/camera'

export function useCamera(isActive: boolean) {
  const videoRef = useRef<HTMLVideoElement>(null)

  const streamRef = useRef<MediaStream | null>(null)

  const [error, setError] = useState<string | null>(null)

  const stop = useCallback(() => {
    stopCameraStream(streamRef.current)

    streamRef.current = null

    if (videoRef.current) {
      detachStreamFromVideo(videoRef.current)
    }
  }, [])

  const start = useCallback(async () => {
    try {
      stop()

      streamRef.current =
        await createCameraStream()

      if (
        videoRef.current &&
        streamRef.current
      ) {
        attachStreamToVideo(
          videoRef.current,
          streamRef.current
        )
      }

      setError(null)
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Camera error'

      console.error(message)

      setError(message)
    }
  }, [stop])

  useEffect(() => {
    if (isActive) {
      start()
    } else {
      stop()
    }

    return () => {
      stop()
    }
  }, [isActive, start, stop])

  return {
    videoRef,
    error,
    retry: start,
    stop,
  }
}