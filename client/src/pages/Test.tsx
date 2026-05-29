import { useEffect, useRef, useState } from "react";
import { AudioService } from "../services/audio/AudioService";
import type { AudioServiceState } from "../services/audio/types";

const Test = () => {
 const audioServiceRef = useRef<AudioService | null>(null);

  const [state, setState] = useState<AudioServiceState>("idle");

  useEffect(() => {
    const service = new AudioService({
      webSocketUrl: "http://localhost:3000", // <-- Socket.IO server

      onStateChange: (newState) => {
        setState(newState);
      },

      onPacket: (packet) => {
        console.log("packet:", packet);
      },

      onError: (error) => {
        console.error("audio error:", error);
      },
    });

    audioServiceRef.current = service;

    return () => {
      service.stop();
      service.close();
    };
  }, []);

  const start = async () => {
    await audioServiceRef.current?.start();
  };

  const stop = async () => {
    await audioServiceRef.current?.stop();
  };

  const pause = () => {
    audioServiceRef.current?.pause();
  };

  const resume = () => {
    audioServiceRef.current?.resume();
  };

  const resetSession = () => {
    audioServiceRef.current?.resetSession();
  };
    return (
  <div style={{ padding: 20 }}>
      <h2>Audio Service</h2>

      <p>State: {state}</p>

      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={start}>Start</button>
        <button onClick={stop}>Stop</button>
        <button onClick={pause}>Pause</button>
        <button onClick={resume}>Resume</button>
        <button onClick={resetSession}>New Session</button>
      </div>
    </div>
    );
};

export default Test;