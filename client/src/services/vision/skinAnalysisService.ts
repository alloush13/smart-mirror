import { captureFrame } from "./captureFrame";

export async function createSkinAnalysisRequest(
  video: HTMLVideoElement,
) {
  const { buffer, width, height } = await captureFrame(video);

  return {
    image: buffer,
    width,
    height,
    mimeType: "image/jpeg",
  };
}