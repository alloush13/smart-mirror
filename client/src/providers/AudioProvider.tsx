import { useCallback, useEffect, useRef, useState } from "react";
import { AudioContext } from "../contexts/AudioContext";

interface Props {
  children: React.ReactNode;
}

export function AudioProvider({ children }: Props) {
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<globalThis.AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [audioContext, setAudioContext] =
    useState<globalThis.AudioContext | null>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);

  const start = useCallback(async () => {
    if (streamRef.current) return;

    const mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });

    const ctx = new window.AudioContext();

    const analyserNode = ctx.createAnalyser();
    analyserNode.fftSize = 512;
    analyserNode.smoothingTimeConstant = 0.8;

    const source = ctx.createMediaStreamSource(mediaStream);
    source.connect(analyserNode);

    streamRef.current = mediaStream;
    audioContextRef.current = ctx;
    analyserRef.current = analyserNode;

    setStream(mediaStream);
    setAudioContext(ctx);
    setAnalyser(analyserNode);
  }, []);

  const stop = useCallback(async () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;

    analyserRef.current = null;

    if (audioContextRef.current) {
      await audioContextRef.current.close();
      audioContextRef.current = null;
    }

    setStream(null);
    setAudioContext(null);
    setAnalyser(null);
  }, []);

  useEffect(() => {
    void start();
  }, [start]);

  useEffect(() => {
    return () => {
      void stop();
    };
  }, [stop]);

  return (
    <AudioContext.Provider
      value={{
        stream,
        audioContext,
        analyser,
        start,
        stop,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
}