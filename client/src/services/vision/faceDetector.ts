import { FaceDetector, FilesetResolver } from "@mediapipe/tasks-vision";

let detector: FaceDetector | null = null;

export async function initFaceDetector() {
  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm"
  );

  detector = await FaceDetector.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath:
        "https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite",
    },
    runningMode: "VIDEO",
  });
}

export function hasFace(video: HTMLVideoElement) {
  if (!detector) return false;

  const result = detector.detectForVideo(video, performance.now());
  return result.detections.length > 0;
}
