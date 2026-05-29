import { useState } from "react";
const Health = () => {
        const [health, setHealth] = useState<{ server?: string; audio?: string; whisper?: string }>({});

    const checkHealth = async () => {
        try {
            const res = await fetch("http://localhost:5000/health");
            const json = await res.json();
            setHealth(json);
        } catch (e) {
            setHealth({ server: "unreachable" });
        }
    };
    return (
        <>
            <div className="mb-4">
                <button className="px-3 py-2 mr-2 bg-blue-600 text-white rounded" onClick={checkHealth}>
                    Check Health
                </button>
                <span className="ml-3">Server: <strong>{health.server ?? "-"}</strong></span>
                <span className="ml-3">Audio: <strong>{health.audio ?? "-"}</strong></span>
                <span className="ml-3">Whisper: <strong>{health.whisper ?? "-"}</strong></span>
            </div>
        </>
    );
};

export default Health;