import { useState, useEffect } from "react";
import HealthHeader from "../components/overview/HealthHeader";
import HealthControls from "../components/overview/HealthControls";
import ServiceCard from "../components/overview/ServiceCard";
import HealthSummary from "../components/overview/HealthSummary";
import { useSocket } from "../hooks/useSocket";

interface HealthStatus {
    audio?: string;
    whisper?: string;
    skinAnalysis?: string;
    faceRecognition?: string;
}


const Overview = () => {
    const [health, setHealth] = useState<HealthStatus>({});
    const [loading, setLoading] = useState(false);
    const [lastCheck, setLastCheck] = useState<string>("");

    const socket = useSocket();

const [socketConnected, setSocketConnected] = useState(socket.connected);


    useEffect(() => {
    const onConnect = () => setSocketConnected(true);
    const onDisconnect = () => setSocketConnected(false);

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    return () => {
        socket.off("connect", onConnect);
        socket.off("disconnect", onDisconnect);
    };
}, [socket]);

    const checkHealth = async () => {
        setLoading(true);
        try {
            const res = await fetch("http://localhost:5000/health");
            const json = await res.json();
            setHealth(json);
            setLastCheck(new Date().toLocaleTimeString());
        } catch (error) {
            console.log(error);
            setHealth({
                audio: "unreachable",
                whisper: "unreachable",
                skinAnalysis: "unreachable",
            });
            setLastCheck(new Date().toLocaleTimeString());
        } finally {
            setLoading(false);
        }
    };

    const services = [
        { name: "Audio Processor", status: health.audio ?? "-", icon: "🎙️" },
        { name: "Whisper", status: health.whisper ?? "-", icon: "🎤" },
        { name: "Skin Analysis", status: health.skinAnalysis ?? "-", icon: "🔬" },
        { name: "Face Recognition", status: health.faceRecognition ?? "-", icon: "🧑‍💻" },
    ];

    return (
        <div className="min-h-screen max-w-4xl mx-auto">
            <HealthHeader socketConnected={socketConnected} />

            <HealthControls
                loading={loading}
                onCheck={checkHealth}
                lastCheck={lastCheck}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
                {services.map((s) => (
                    <ServiceCard key={s.name} service={s} />
                ))}
            </div>

            <HealthSummary services={services} />
        </div>
    );
};

export default Overview;