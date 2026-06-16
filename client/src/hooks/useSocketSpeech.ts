import { useEffect, useState } from 'react';

import { useSocket } from './useSocket';

import type { IntentResponse } from '../intents/intentTypes';

import { IntentCommands } from '../intents/intentCommands';
import { executeIntent } from '../intents/intentRouter';
import { cameraService } from '../services/cameraService';
import { speechSynthesisService } from '../services/speechSynthesisService';
import { useCamera } from '../contexts/CameraContext';

export const useSocketSpeech = () => {
  const socket = useSocket();
  const { requestFaceRecognition, setActive, setStream } = useCamera();

  const [transcript, setTranscript] =
    useState('');

  useEffect(() => {
    const onResult = (
      data: IntentResponse,
    ) => {
      setTranscript(data.answer);

      if (data.intent !== IntentCommands.FACE_RECOGNITION) {
        speechSynthesisService.speak(data.answer);
      }

      executeIntent(data, {
        openCamera: async () => {
          const stream = await cameraService.start();
          setStream(stream);
          setActive(true);
        },
        closeCamera: async () => {
          cameraService.stop();
          setStream(null);
          setActive(false);
        },
        recognizeFace: () => {
          requestFaceRecognition();
        },
      });
    };

    socket.on(
      'intent:result',
      onResult,
    );

    return () => {
      speechSynthesisService.stop();

      socket.off(
        'intent:result',
        onResult,
      );
    };
  }, [requestFaceRecognition, setActive, setStream, socket]);

  return { transcript };
};
