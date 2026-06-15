import { useEffect, useRef, useState } from "react";
import { useCamera } from "../../contexts/CameraContext";

export default function CameraView() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [streamReady, setStreamReady] = useState(false);
  const { active, stream } = useCamera();

  useEffect(() => {
    const video = videoRef.current;

    if (!active || !stream || !video) {
      setStreamReady(false);
      return;
    }

    video.srcObject = stream;

    video
      .play()
      .then(() => {
        setStreamReady(true);
        console.log("📺 Camera rendered");
      })
      .catch(console.error);
  }, [active, stream]);

  if (!active) return null;

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted
      className={`absolute inset-0 w-full h-full scale-x-[-1] object-cover bg-black transition-opacity duration-300 ${
        streamReady ? "opacity-100" : "opacity-0"
      }`}
    />
  );
}
