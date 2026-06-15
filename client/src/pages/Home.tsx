import { useEffect } from "react";
import { useSpeechRecorder } from "../hooks/useSpeechRecorder";
import { useSocketSpeech } from "../hooks/useSocketSpeech";
import { useClock } from "../hooks/useClock";

import VoiceOrb from "../components/home/VoiceOrb";
import Clock from "../components/home/Clock";
import StatusText from "../components/home/StatusText";
import CameraView from "../components/camera/CameraView";
import { useCamera } from "../contexts/CameraContext";

const Home = () => {
  const { volume, recording, isSpeaking, start } = useSpeechRecorder();
  useSocketSpeech();
  const { active: cameraActive } = useCamera();
  const time = useClock();

  const voiceActive = isSpeaking || recording;

  useEffect(() => {
    start();
  }, [start]);

  return (
    <div className="relative h-screen w-full overflow-hidden bg-black text-white">

      {/* Camera always ready but stream controlled externally */}
      <CameraView />

      {!cameraActive && (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.18),transparent_65%)]" />
      )}

      <div className="relative z-20 h-full flex flex-col">

        {!cameraActive && (
          <>
            <div className="text-center mt-10">
              <h1 className="text-5xl font-light tracking-[0.3em]">
                SMART MIRROR
              </h1>
              <p className="mt-4 text-gray-400">
                Voice Assistant
              </p>
            </div>

            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">

                <Clock time={time} />

                <div className="mt-4 text-xs text-gray-500">
                  Volume: {volume.toFixed(1)}
                </div>

                <StatusText listening={voiceActive} />

              </div>
            </div>
          </>
        )}

        <VoiceOrb volume={volume} listening={isSpeaking} />
      </div>
    </div>
  );
};

export default Home;
