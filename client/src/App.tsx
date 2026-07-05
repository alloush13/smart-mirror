import { useSpeechRecorder } from "./hooks/useSpeechRecorder";
import { useSocketSpeech } from "./hooks/useSocketSpeech";
import { useClock } from "./hooks/useClock";
import { useSocket } from "./hooks/useSocket";

import Clock from "./components/home/Clock";
import StatusText from "./components/home/StatusText";
import CameraView from "./components/camera/CameraView";
import { useCamera } from "./contexts/CameraContext";
import ScreenBorder from "./components/layout/ScreenBorder";
import { useEffect, useState } from "react";

const App = () => {
  const { volume, recording, isSpeaking } = useSpeechRecorder();
  useSocketSpeech();
  const socket = useSocket();

  const [connected, setConnected] = useState(socket.connected);

  useEffect(() => {
    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, [socket]);

  const { active: cameraActive } = useCamera();

  const time = useClock();

  const voiceActive = isSpeaking || recording;

  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden bg-black text-white">
      <ScreenBorder
        connected={connected}
        active={voiceActive}
      />
      <CameraView />

      {!cameraActive && (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.18),transparent_65%)]" />
      )}

      <div className="relative z-20 h-full flex flex-col">
        {!cameraActive && (
          <>
            <div className="text-center mt-14">
              <h1 className="text-[clamp(1.5rem,4vw,3rem)] font-light tracking-[0.2em]">
                SMART MIRROR
              </h1>
              <p className="mt-4 text-gray-400">Voice Assistant</p>
            </div>

            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Clock time={time} />

                <div className="text-[clamp(0.7rem,1.5vw,1rem)]">
                  Volume: {volume.toFixed(1)}
                </div>

                <StatusText listening={voiceActive} />
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
};

export default App;