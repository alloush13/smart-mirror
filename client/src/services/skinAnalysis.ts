export interface SkinDetection {
  x: number
  y: number
  width: number
  height: number
  confidence: number
  class: number
  class_name: string
}

export interface SkinAnalysisResult {
  success: boolean
  detections: SkinDetection[]
  count: number
  error?: string
}

const SERVER_URL =
  import.meta.env.VITE_SERVER_URL ||
  'http://localhost:3000'

export async function analyzeSkinImage({
  imageBase64,
  conf,
  iou,
}: {
  imageBase64: string
  conf?: number
  iou?: number
}): Promise<SkinAnalysisResult> {
  const response = await fetch(
    `${SERVER_URL}/skin/analyze`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageBase64,
        conf,
        iou,
      }),
    },
  )

  const data = (await response.json()) as SkinAnalysisResult

  if (!response.ok || !data.success) {
    throw new Error(data.error ?? 'Skin analysis failed')
  }

  return data
}