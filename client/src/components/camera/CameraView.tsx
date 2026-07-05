import { useEffect, useRef, useState } from "react";
import { useCamera } from "../../contexts/CameraContext";
import { useFaceTrigger } from "../../hooks/useFaceTrigger";
import { speechSynthesisService } from "../../services/speechSynthesisService";
import { useSkinAnalysisTrigger } from "../../hooks/useSkinAnalysisTrigger";
import { useSocket } from "../../hooks/useSocket";
import SkinOverlay from "./SkinOverlay";
import type { SkinAnalysisResult } from "./SkinOverlay";

export default function CameraView() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const lastSpokenFaceRef = useRef("");

  const socket = useSocket();

  const [streamReady, setStreamReady] = useState(false);

  const [skinImage, setSkinImage] = useState<string | null>(null);
  const [skinResult, setSkinResult] = useState<SkinAnalysisResult | null>(null);

  const { active, stream } = useCamera();

  const { result, recognizing } = useFaceTrigger(
    videoRef,
    active && streamReady
  );

  useSkinAnalysisTrigger(videoRef);

  useEffect(() => {
    if (recognizing) console.log("Recognizing face...");
  }, [recognizing]);

  useEffect(() => {
    if (!result) return;

    const name = result.predictions[0]?.name?.trim();
    const normalized = name?.toLowerCase();
    const key = normalized || "unknown";

    if (lastSpokenFaceRef.current === key) return;
    lastSpokenFaceRef.current = key;

    if (normalized && normalized !== "stranger") {
      speechSynthesisService.speak(`أهلاً ${name}`);
    } else {
      speechSynthesisService.speak("لم يتم التعرف عليك");
    }
  }, [result]);

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
      .then(() => setStreamReady(true))
      .catch(console.error);

    return () => {
      video.srcObject = null;
      setStreamReady(false);
    };
  }, [active, stream]);

  /**
   * SKIN RESULT (image local + overlay)
   */
  useEffect(() => {
    const onResult = (data: SkinAnalysisResult) => {
      const SKIN_OVERLAY_DURATION = Number(
        import.meta.env.VITE_SKIN_OVERLAY_DURATION ?? 3000
      );

      // snapshot current video frame as image
      const video = videoRef.current;
      if (!video) return;

      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.drawImage(video, 0, 0);

      const url = canvas.toDataURL("image/jpeg");
      
      setSkinImage(url);
      setSkinResult(data);

      setTimeout(() => {
        setSkinImage(null);
        setSkinResult(null);
      }, SKIN_OVERLAY_DURATION);
    };

    socket.on("skin:result", onResult);

    return () => {
      socket.off("skin:result", onResult);
    };
  }, [socket]);

  if (!active) return null;

  return (
    <>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`absolute inset-0 w-full h-full scale-x-[-1] object-cover bg-black transition-opacity ${streamReady ? "opacity-100" : "opacity-0"
          }`}
      />
      {skinImage && skinResult && (
        <SkinOverlay imageUrl={skinImage} result={skinResult} />
      )}
    </>
  );
}