import { useEffect, useRef, useState } from "react";
import { socket } from "../socket";
import { hasFace, initFaceDetector } from "../services/vision/faceDetector";

export interface FaceRecognitionResult {
  predictions: {
    name: string;
    confidence: number;
  }[];
}

export function useFaceTrigger(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  enabled: boolean,
  requestId = 0
) {
  const [result, setResult] = useState<FaceRecognitionResult | null>(null);
  const [error, setError] = useState("");
  const [recognizing, setRecognizing] = useState(false);

  const triggered = useRef(false);
  const initialized = useRef(false);
  const sending = useRef(false);
  const loggedSocketWait = useRef(false);

  useEffect(() => {
    const onResult = (data: FaceRecognitionResult) => {
      setResult(data);
      setError("");
      setRecognizing(false);
      console.log("🙂 Face recognition result", data);
    };

    const onError = (err: { message?: string }) => {
      setError(err?.message || "Face recognition failed");
      setRecognizing(false);
      console.error("Face recognition error", err);
    };

    socket.on("face:result", onResult);
    socket.on("face:error", onError);

    return () => {
      socket.off("face:result", onResult);
      socket.off("face:error", onError);
    };
  }, []);

  useEffect(() => {
    if (!enabled) {
      triggered.current = false;
      sending.current = false;
      setRecognizing(false);
      return;
    }

    triggered.current = false;
    sending.current = false;
    setResult(null);
    setError("");
    setRecognizing(false);

    let running = true;
    let frameId = 0;

    const captureAndSend = async (video: HTMLVideoElement) => {
      if (triggered.current || sending.current) return;

      sending.current = true;

      try {
        if (!socket.connected) {
          if (!loggedSocketWait.current) {
            loggedSocketWait.current = true;
            console.warn("Face found, waiting for socket connection");
          }

          return;
        }

        loggedSocketWait.current = false;

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        if (!ctx || video.videoWidth === 0 || video.videoHeight === 0) {
          return;
        }

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const blob = await new Promise<Blob | null>((res) =>
          canvas.toBlob(res, "image/jpeg", 0.85)
        );

        if (!blob) return;

        const buffer = await blob.arrayBuffer();

        setRecognizing(true);
        setError("");

        socket.emit("face:recognize", {
          image: buffer,
          width: canvas.width,
          height: canvas.height,
          mimeType: "image/jpeg",
        });

        triggered.current = true;
        console.log("📸 Face image sent", {
          socketConnected: socket.connected,
          bytes: buffer.byteLength,
        });
      } catch (error) {
        console.error("Face image send failed", error);
      } finally {
        sending.current = false;
      }
    };

    const start = async () => {
      try {
        if (!initialized.current) {
          await initFaceDetector();
          initialized.current = true;
          console.log("🙂 Face detector ready");
        }
      } catch (error) {
        console.error("Face detector init failed", error);
        return;
      }

      const loop = async () => {
        if (!running) return;

        const video = videoRef.current;

        if (
          video &&
          video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA &&
          video.videoWidth > 0 &&
          video.videoHeight > 0
        ) {
          const faceFound = hasFace(video);

          if (faceFound) {
            await captureAndSend(video);
          }
        }

        frameId = requestAnimationFrame(loop);
      };

      loop();
    };

    start();

    return () => {
      running = false;
      cancelAnimationFrame(frameId);
    };
  }, [enabled, requestId, videoRef]);

  return {
    result,
    error,
    recognizing,
  };
}
