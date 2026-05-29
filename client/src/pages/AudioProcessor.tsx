import { useEffect, useRef, useState } from "react";
import { AudioService } from "../services/audio/AudioService";
import type { AudioServiceState } from "../services/audio/types";

const AudioProcessor = () => {
    const audioServiceRef = useRef<AudioService | null>(null);
    const [state, setState] = useState<AudioServiceState>("idle");
    const [socketConnected, setSocketConnected] = useState(false);

    useEffect(() => {
        const service = new AudioService({
            webSocketUrl: "http://localhost:5000",
            onStateChange: (newState) => setState(newState),
            onError: (err) => console.error("audio error:", err),
            onPacket: (p) => console.debug("packet", p),
        });

        audioServiceRef.current = service;

        return () => {
            service.stop();
            service.close();
        };
    }, []);

    const start = async () => {
        try {
            await audioServiceRef.current?.start();
            setSocketConnected(true);
        } catch (e) {
            console.error(e);
        }
    };

    const stop = async () => {
        await audioServiceRef.current?.stop();
        audioServiceRef.current?.close();
        setSocketConnected(false);
    };



    return (
        <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Audio Processor — Test</h2>

 

            <div className="mb-4">
                <p>Socket connected: {socketConnected ? "yes" : "no"}</p>
                <p>AudioService state: {state}</p>

                <div className="flex gap-2 mt-2">
                    <button className="px-3 py-2 bg-green-600 text-white rounded" onClick={start}>
                        Start
                    </button>
                    <button className="px-3 py-2 bg-red-600 text-white rounded" onClick={stop}>
                        Stop
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AudioProcessor;