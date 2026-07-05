import { useEffect, useRef, useState, useCallback } from "react";

import { useSocket } from "./useSocket";

import type { IntentResponse } from "../intents/intentTypes";

import { IntentCommands } from "../intents/intentCommands";
import { executeIntent } from "../intents/intentRouter";
import { cameraService } from "../services/cameraService";
import { speechSynthesisService } from "../services/speechSynthesisService";
import { useCamera } from "../contexts/CameraContext";

export const useSocketSpeech = () => {
  const socket = useSocket();

  const { requestFaceRecognition, requestSkinAnalysis, setActive, setStream } = useCamera();

  const [transcript, setTranscript] = useState("");

  const handlersRef = useRef({
    requestFaceRecognition,
    requestSkinAnalysis,
    setActive,
    setStream,
  });

  useEffect(() => {
    handlersRef.current = {
      requestFaceRecognition,
      requestSkinAnalysis,
      setActive,
      setStream,
    };
  }, [requestFaceRecognition, requestSkinAnalysis, setActive, setStream]);

  const onResult = useCallback((data: IntentResponse) => {
    setTranscript(data.answer);

    if (data.intent !== IntentCommands.FACE_RECOGNITION) {
      speechSynthesisService.speak(data.answer);
    }

    executeIntent(data, {
      openCamera: async () => {
        const stream = await cameraService.start();
        handlersRef.current.setStream(stream);
        handlersRef.current.setActive(true);
      },

      closeCamera: async () => {
        cameraService.stop();
        handlersRef.current.setStream(null);
        handlersRef.current.setActive(false);
      },

      recognizeFace: () => {
        handlersRef.current.requestFaceRecognition();
      },

      analyzeSkin: () => {
        handlersRef.current.requestSkinAnalysis();
      },
    });
  }, []);

  useEffect(() => {
    socket.on("intent:result", onResult);

    return () => {
      speechSynthesisService.stop();
      socket.off("intent:result", onResult);
    };
  }, [socket, onResult]);

  return { transcript };
};
