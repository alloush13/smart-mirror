import { useEffect, useRef, useState } from "react";
import { useCamera } from "../contexts/CameraContext";
import { useSocket } from "./useSocket";
import { captureFrame } from "../services/vision/captureFrame";

export function useSkinAnalysisTrigger(
  videoRef: React.RefObject<HTMLVideoElement | null>
) {
  const socket = useSocket();
  const { skinAnalysisRequestId } = useCamera();

  const lastId = useRef(0);
  const imageBlobRef = useRef<Blob | null>(null);

  const [imageBlob, setImageBlob] = useState<Blob | null>(null);

  useEffect(() => {
    const run = async () => {
      const video = videoRef.current;

      if (!video) return;
      if (skinAnalysisRequestId === lastId.current) return;

      // مهم جدًا
      if (video.readyState < 2) return;
      if (!video.videoWidth || !video.videoHeight) return;

      lastId.current = skinAnalysisRequestId;

      try {
        const { buffer, width, height } = await captureFrame(video);

        const blob = new Blob([buffer], { type: "image/jpeg" });

        imageBlobRef.current = blob;
        setImageBlob(blob);

        socket.emit("skin:analyze", {
          image: buffer,
          width,
          height,
          mimeType: "image/jpeg",
        });
      } catch (err) {
        console.warn("Skin capture failed:", err);
      }
    };

    run();
  }, [skinAnalysisRequestId, socket, videoRef]);

  const clearImage = () => {
    imageBlobRef.current = null;
    setImageBlob(null);
  };

  return { imageBlob, imageBlobRef, clearImage };
}