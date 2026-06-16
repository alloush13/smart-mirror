import { useEffect, useRef, useState } from "react";
import { useCamera } from "../../contexts/CameraContext";
import { useFaceTrigger } from "../../hooks/useFaceTrigger";
import { speechSynthesisService } from "../../services/speechSynthesisService";

export default function CameraView() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const lastSpokenFaceRef = useRef("");
  const [streamReady, setStreamReady] = useState(false);
  const { active, stream } = useCamera();
  const { result, error, recognizing } = useFaceTrigger(
    videoRef,
    active && streamReady
  );

  useEffect(() => {
    if (recognizing) {
      console.log("Recognizing face...");
    }
  }, [recognizing]);

  useEffect(() => {
    if (result) {
      console.log("Face result in camera view", result);

      const name = result.predictions[0]?.name?.trim();
      const normalizedName = name?.toLowerCase();
      const spokenKey = normalizedName || "unknown";

      if (lastSpokenFaceRef.current === spokenKey) return;

      lastSpokenFaceRef.current = spokenKey;

      if (normalizedName && normalizedName !== "stranger") {
        speechSynthesisService.speak(`أهلاً ${name}، سعيد برؤيتك`);
      } else {
        speechSynthesisService.speak("لم يتم التعرف عليك");
      }
    }
  }, [result]);

  useEffect(() => {
    if (error) {
      console.error("Face error in camera view", error);
    }
  }, [error]);

  useEffect(() => {
    const video = videoRef.current;

    if (!active || !stream || !video) {
      setStreamReady(false);
      lastSpokenFaceRef.current = "";
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

    return () => {
      video.srcObject = null;
      setStreamReady(false);
    };
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
