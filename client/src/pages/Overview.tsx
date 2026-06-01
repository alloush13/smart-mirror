import { useState, useEffect } from "react";
import HealthHeader from "../components/overview/HealthHeader";
import HealthControls from "../components/overview/HealthControls";
import ServiceCard from "../components/overview/ServiceCard";
import HealthSummary from "../components/overview/HealthSummary";

interface HealthStatus {
    server?: string;
    audio?: string;
    whisper?: string;
    skinAnalysis?: string;
    faceRecognition?: string;
}

const Overview = () => {
    const [health, setHealth] = useState<HealthStatus>({});
    const [loading, setLoading] = useState(false);
    const [lastCheck, setLastCheck] = useState<string>("");
    const [autoRefresh, setAutoRefresh] = useState(false);

    const checkHealth = async () => {
        setLoading(true);
        try {
            const res = await fetch("http://localhost:5000/health");
            const json = await res.json();
            setHealth(json);
            setLastCheck(new Date().toLocaleTimeString());
        } catch (e) {
            setHealth({
                server: "unreachable",
                audio: "unreachable",
                whisper: "unreachable",
                skinAnalysis: json["skin-analysis"] || json.skinAnalysis,
            });
            setLastCheck(new Date().toLocaleTimeString());
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (autoRefresh) {
            const interval = setInterval(checkHealth, 5000);
            return () => clearInterval(interval);
        }
    }, [autoRefresh]);

    const services = [
        { name: "Server", status: health.server ?? "-", icon: "🖥️" },
        { name: "Audio Processor", status: health.audio ?? "-", icon: "🎙️" },
        { name: "Whisper", status: health.whisper ?? "-", icon: "🎤" },
        { name: "Skin Analysis", status: health.skinAnalysis ?? "-", icon: "🔬" },
        { name: "Face Recognition", status: health.faceRecognition ?? "-", icon: "🧑‍💻" },
    ];

    return (
        <div className="min-h-screen max-w-4xl mx-auto">
            <HealthHeader />

            <HealthControls
                loading={loading}
                onCheck={checkHealth}
                autoRefresh={autoRefresh}
                setAutoRefresh={setAutoRefresh}
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