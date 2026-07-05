export async function captureFrame(video: HTMLVideoElement): Promise<{
  buffer: ArrayBuffer;
  width: number;
  height: number;
}> {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Canvas context not available");
  }

  const width = video.videoWidth;
  const height = video.videoHeight;

  canvas.width = width;
  canvas.height = height;

  ctx.drawImage(video, 0, 0, width, height);

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, "image/jpeg", 0.85);
  });

  if (!blob) {
    throw new Error("Failed to create image blob");
  }

  const buffer = await blob.arrayBuffer();

  return { buffer, width, height };
}