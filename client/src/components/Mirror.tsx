import type { RefObject } from 'react'

interface MirrorProps {
  isActive?: boolean
  error?: string | null
  videoRef: RefObject<HTMLVideoElement | null>
  retry: () => void
}

export default function Mirror({
  isActive = false,
  error,
  videoRef,
  retry,
}: MirrorProps) {
  return (
    <div className="flex h-full w-full items-center justify-center bg-black">
      <div className="relative h-[95vh] w-[95vw] overflow-hidden rounded-[24px] border border-white/10 bg-black shadow-[0_40px_120px_rgba(0,0,0,0.75)]">
        {isActive ? (
          error ? (
            <div className="flex h-full w-full flex-col items-center justify-center gap-4 px-6 text-center text-white">
              <div className="text-2xl text-red-400">
                خطأ في الكاميرا
              </div>
              <div className="max-w-md text-sm text-gray-300">
                {error}
              </div>
              <button
                onClick={retry}
                className="rounded bg-white px-4 py-2 text-sm font-medium text-black"
              >
                إعادة المحاولة
              </button>
            </div>
          ) : (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="h-full w-full object-cover scale-x-[-1]"
            />
          )
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-gray-500">
            المرآة متوقفة
          </div>
        )}
      </div>
    </div>
  )
}