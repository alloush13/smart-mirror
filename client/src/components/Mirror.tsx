import { useEffect, useRef, useState } from 'react'

interface MirrorProps {
  isListening?: boolean
  isSpeaking?: boolean
}

export default function Mirror({
  isListening = false,
  isSpeaking = false,
}: MirrorProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [hasPermission, setHasPermission] =
    useState<boolean | null>(null)
  const [isLoading, setIsLoading] =
    useState(true)

  useEffect(() => {
    const initCamera = async () => {
      try {
        const stream =
          await navigator.mediaDevices.getUserMedia(
            {
              video: {
                facingMode: 'user',
                width: {
                  ideal: 1280,
                },
                height: {
                  ideal: 720,
                },
              },
              audio: false,
            },
          )

        if (videoRef.current) {
          videoRef.current.srcObject =
            stream
        }

        setHasPermission(true)
        setIsLoading(false)
      } catch (error) {
        console.error(
          'Error accessing camera:',
          error,
        )
        setHasPermission(false)
        setIsLoading(false)
      }
    }

    initCamera()

    return () => {
      if (videoRef.current?.srcObject) {
        const tracks = (
          videoRef.current
            .srcObject as MediaStream
        ).getTracks()
        tracks.forEach(
          (track) => track.stop(),
        )
      }
    }
  }, [])

  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center
          w-full h-full"
      >
        <div className="text-xl text-gray-400">
          Loading camera...
        </div>
      </div>
    )
  }

  if (hasPermission === false) {
    return (
      <div
        className="flex flex-col items-center
          justify-center w-full h-full gap-4"
      >
        <div className="text-2xl text-red-400">
          Camera Permission Denied
        </div>
        <p className="text-gray-400">
          Please allow camera access to use
          Smart Mirror
        </p>
      </div>
    )
  }

  return (
    <div
      className="flex flex-col items-center
        justify-center w-full h-full gap-6"
    >
      {/* Mirror Video Container */}
      <div
        className={`relative rounded-3xl
          overflow-hidden shadow-2xl
          transition-all duration-300 ${
            isSpeaking
              ? 'ring-4 ring-green-400 scale-105'
              : isListening
                ? 'ring-4 ring-blue-400'
                : 'ring-2 ring-gray-600'
          }
          w-full max-w-3xl aspect-video`}
      >
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover
            scale-x-[-1]"
        />

        {/* Status Indicator */}
        <div
          className="absolute top-6 left-6 flex
            items-center gap-2"
        >
          <div
            className={`w-4 h-4 rounded-full
              ${
                isSpeaking
                  ? 'bg-green-400 animate-pulse'
                  : isListening
                    ? 'bg-blue-400 animate-pulse'
                    : 'bg-gray-500'
              }`}
          />
          <span className="text-sm font-medium">
            {isSpeaking
              ? 'Speaking'
              : isListening
                ? 'Listening'
                : 'Ready'}
          </span>
        </div>
      </div>
    </div>
  )
}
