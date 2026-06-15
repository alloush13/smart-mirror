import { useEffect, useState } from 'react';

import { useSocket } from './useSocket';

import type { IntentResponse } from '../intents/intentTypes';

import { executeIntent } from '../intents/intentRouter';
import { cameraService } from '../services/cameraService';
import { speechSynthesisService } from '../services/speechSynthesisService';
import { useCamera } from '../contexts/CameraContext';

export const useSocketSpeech = () => {
  const socket = useSocket();
  const { setActive, setStream } = useCamera();

  const [transcript, setTranscript] =
    useState('');

  useEffect(() => {
    const onResult = (
      data: IntentResponse,
    ) => {
      setTranscript(data.answer);
      speechSynthesisService.speak(data.answer);

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
  }, [setActive, setStream, socket]);

  return { transcript };
};
