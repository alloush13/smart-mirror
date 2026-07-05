import { useEffect, useRef, useState, useCallback } from "react";

import { useSocket } from "./useSocket";
import { hasFace, initFaceDetector } from "../services/vision/faceDetector";
import { captureFrame } from "../services/vision/captureFrame";
import { FaceRecognitionService } from "../services/vision/faceRecognitionService";
import { SocketEvents } from "../constants/socketEvents";

export interface FaceRecognitionResult {
  predictions: {
    name: string;
    confidence: number;
  }[];
}

type State = {
  result: FaceRecognitionResult | null;
  error: string;
  recognizing: boolean;
};

export function useFaceTrigger(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  enabled: boolean,
  requestId = 0
) {
  const socket = useSocket();

  const [state, setState] = useState<State>({
    result: null,
    error: "",
    recognizing: false,
  });

  const triggered = useRef(false);
  const initialized = useRef(false);
  const sending = useRef(false);
  const warnedSocket = useRef(false);
  const serviceRef = useRef<FaceRecognitionService | null>(null);

  /**
   * Reset state safely
   */
  const reset = useCallback(() => {
    triggered.current = false;
    sending.current = false;
    warnedSocket.current = false;

    setState({
      result: null,
      error: "",
      recognizing: false,
    });
  }, []);

  /**
   * Socket listeners
   */
  useEffect(() => {
    const onResult = (data: FaceRecognitionResult) => {
      setState((prev) => ({
        ...prev,
        result: data,
        error: "",
        recognizing: false,
      }));
    };

    const onError = (err: { message?: string }) => {
      setState((prev) => ({
        ...prev,
        error: err?.message || "Face recognition failed",
        recognizing: false,
      }));
    };

    socket.on(SocketEvents.FACE_RESULT, onResult);
    socket.on(SocketEvents.FACE_ERROR, onError);

    return () => {
      socket.off(SocketEvents.FACE_RESULT, onResult);
      socket.off(SocketEvents.FACE_ERROR, onError);
    };
  }, [socket]);

  /**
   * Main loop
   */
  useEffect(() => {
    if (!enabled) {
      queueMicrotask(reset);
      return;
    }

    queueMicrotask(reset);

    let running = true;
    let frameId = 0;

    const isVideoReady = (video: HTMLVideoElement) => {
      return (
        video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA &&
        video.videoWidth > 0 &&
        video.videoHeight > 0
      );
    };

    const handleFace = async (video: HTMLVideoElement) => {
      if (triggered.current || sending.current) return;

      sending.current = true;

      try {
        if (!socket.connected) {
          if (!warnedSocket.current) {
            warnedSocket.current = true;
            console.warn("⏳ Waiting for socket connection...");
          }
          return;
        }

        warnedSocket.current = false;

        if (!serviceRef.current) {
          serviceRef.current = new FaceRecognitionService(socket);
        }

        const { buffer, width, height } = await captureFrame(video);

        setState((prev) => ({
          ...prev,
          recognizing: true,
          error: "",
        }));

        serviceRef.current.recognize({
          image: buffer,
          width,
          height,
        });

        triggered.current = true;
      } catch (err) {
        console.error("Face recognition error:", err);

        setState((prev) => ({
          ...prev,
          error: "Failed to process face",
          recognizing: false,
        }));
      } finally {
        sending.current = false;
      }
    };

    const loop = async () => {
      if (!running) return;

      const video = videoRef.current;

      if (video && isVideoReady(video)) {
        const faceFound = hasFace(video);

        if (faceFound) {
          await handleFace(video);
        }
      }

      frameId = requestAnimationFrame(loop);
    };

    const start = async () => {
      try {
        if (!initialized.current) {
          await initFaceDetector();
          initialized.current = true;
        }
      } catch (e) {
        console.error("Face detector init failed:", e);
        return;
      }

      loop();
    };

    start();

    return () => {
      running = false;
      cancelAnimationFrame(frameId);
    };
  }, [enabled, requestId, videoRef, socket, reset]);

  return state;
}