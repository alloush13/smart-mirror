import { useCallback, useState } from 'react'

import { captureVideoFrame } from '../services/camera'
import {
  analyzeSkinImage,
  type SkinAnalysisResult,
} from '../services/skinAnalysis'

export function useSkinAnalysis() {
  const [result, setResult] =
    useState<SkinAnalysisResult | null>(null)
  const [error, setError] =
    useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] =
    useState(false)

  const analyzeCurrentFrame = useCallback(
    async (video: HTMLVideoElement | null) => {
      if (!video) {
        const message = 'الكاميرا غير متاحة'
        setError(message)
        throw new Error(message)
      }

      const imageBase64 = captureVideoFrame(video)

      if (!imageBase64) {
        const message = 'تعذر التقاط صورة من الكاميرا'
        setError(message)
        throw new Error(message)
      }

      setIsAnalyzing(true)
      setError(null)

      try {
        const analysis = await analyzeSkinImage({
          imageBase64,
        })

        setResult(analysis)

        return analysis
      } catch (analysisError) {
        const message =
          analysisError instanceof Error
            ? analysisError.message
            : 'Skin analysis failed'

        setError(message)
        throw analysisError
      } finally {
        setIsAnalyzing(false)
      }
    },
    [],
  )

  const clearResult = useCallback(() => {
    setResult(null)
    setError(null)
  }, [])

  return {
    result,
    error,
    isAnalyzing,
    analyzeCurrentFrame,
    clearResult,
  }
}