import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { AudioService } from "../services/audio/AudioService";
import type { AudioServiceState } from "../services/audio/types";

const SOCKET_URL = "http://localhost:5000";

const AudioProcessor = () => {
  const socketRef = useRef<Socket | null>(null);
  const audioServiceRef = useRef<AudioService | null>(null);

  const [state, setState] = useState<AudioServiceState>("idle");
  const [socketConnected, setSocketConnected] = useState(false);

  // clips
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const [recording, setRecording] = useState(false);

  useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports: ["websocket"],
      autoConnect: true,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setSocketConnected(true);
      console.log("socket connected:", socket.id);
    });

    socket.on("disconnect", () => {
      setSocketConnected(false);
    });

    const service = new AudioService({
      webSocketUrl: SOCKET_URL,
      onStateChange: (newState) => setState(newState),
      onError: (err) => console.error("audio error:", err),
      onPacket: (p) => console.debug("packet", p),
    });

    audioServiceRef.current = service;

    return () => {
      socket.disconnect();
      service.stop();
      service.close();
    };
  }, []);

  const start = async () => {
    await audioServiceRef.current?.start();
  };

  const stop = async () => {
    await audioServiceRef.current?.stop();
    audioServiceRef.current?.close();
  };

  // =========================
  // RECORDING
  // =========================

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      streamRef.current = stream;

      const mr = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      });

      mediaRecorderRef.current = mr;
      chunksRef.current = [];

      mr.ondataavailable = (ev) => {
        if (ev.data && ev.data.size > 0) {
          chunksRef.current.push(ev.data);
        }
      };

      mr.start(250); // chunk every 250ms
      setRecording(true);
    } catch (e) {
      console.error("microphone error:", e);
    }
  };

  const stopRecording = async () => {
    const mr = mediaRecorderRef.current;

    if (!mr) return;

    mr.onstop = async () => {
      const blob = new Blob(chunksRef.current, {
        type: "audio/webm",
      });

      await sendClip(blob);

      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };

    mr.stop();
    setRecording(false);
    mediaRecorderRef.current = null;
  };

  // =========================
  // SEND TO SERVER (FIXED)
  // =========================

  const sendClip = async (blob: Blob) => {
    const socket = socketRef.current;
    if (!socket) return;

    const arrayBuffer = await blob.arrayBuffer();

    const chunkSize = 32 * 1024;

    for (let offset = 0; offset < arrayBuffer.byteLength; offset += chunkSize) {
      const chunk = arrayBuffer.slice(offset, offset + chunkSize);

      await new Promise<void>((resolve, reject) => {
        socket.emit(
          "audio:chunk",
          new Uint8Array(chunk),
          (ack: any) => {
            if (ack?.ok) resolve();
            else reject("ack failed");
          }
        );
      });

      // small throttle to avoid overload
      await new Promise((r) => setTimeout(r, 10));
    }

    socket.emit("audio:end", null, (ack: any) => {
      console.log("stream ended:", ack);
    });
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">
        Audio Processor — Fixed Client
      </h2>

      <div className="mb-4">
        <p>Socket: {socketConnected ? "connected" : "disconnected"}</p>
        <p>State: {state}</p>

        <div className="flex gap-2 mt-2">
          <button onClick={start} className="px-3 py-2 bg-green-600 text-white rounded">
            Start
          </button>

          <button onClick={stop} className="px-3 py-2 bg-red-600 text-white rounded">
            Stop
          </button>
        </div>
      </div>

      <div className="mt-6">
        <button
          onClick={recording ? stopRecording : startRecording}
          className={`px-4 py-2 rounded text-white ${
            recording ? "bg-red-600" : "bg-black"
          }`}
        >
          {recording ? "Stop Recording" : "Start Recording"}
        </button>
      </div>
    </div>
  );
};

export default AudioProcessor;