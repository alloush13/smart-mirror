import { useState, useEffect } from "react";

interface HealthStatus {
    server?: string;
    audio?: string;
    whisper?: string;
}

interface ServiceStatus {
    name: string;
    status: string;
    icon: string;
}

const Health = () => {
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
            setHealth({ server: "unreachable", audio: "unreachable", whisper: "unreachable" });
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

    const getStatusColor = (status?: string) => {
        if (!status || status === "-") return "bg-gray-100 text-gray-600 border-gray-300";
        if (status === "ok" || status === "SERVING") return "bg-green-50 text-green-700 border-green-300";
        if (status.includes("unreachable")) return "bg-red-50 text-red-700 border-red-300";
        return "bg-yellow-50 text-yellow-700 border-yellow-300";
    };

    const getStatusBadgeColor = (status?: string) => {
        if (!status || status === "-") return "bg-gray-300";
        if (status === "ok" || status === "SERVING") return "bg-green-500";
        if (status.includes("unreachable")) return "bg-red-500";
        return "bg-yellow-500";
    };

    const getServiceIcon = (service: string) => {
        switch (service.toLowerCase()) {
            case "server":
                return "🖥️";
            case "audio":
                return "🎙️";
            case "whisper":
                return "🎤";
            default:
                return "⚙️";
        }
    };

    const services: ServiceStatus[] = [
        { name: "Server", status: health.server ?? "-", icon: "🖥️" },
        { name: "Audio Processor", status: health.audio ?? "-", icon: "🎙️" },
        { name: "Whisper", status: health.whisper ?? "-", icon: "🎤" },
    ];

    return (
        <div className="min-h-screen">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-12">
                    <div className="flex items-center gap-3 mb-3">
                        <h1 className="text-4xl font-light text-gray-900 tracking-tight">Health Status</h1>
                    </div>
                    <p className="text-gray-500 text-sm font-medium uppercase tracking-wide">Monitor your services</p>
                    <div className="h-1 w-12 bg-gray-300 rounded-full mt-4"></div>
                </div>

                {/* Controls */}
                <div className="mb-8 flex flex-wrap gap-4 items-center justify-between border-b border-gray-200 pb-6">
                    <button
                        onClick={checkHealth}
                        disabled={loading}
                        className={`px-6 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 flex items-center gap-2 ${loading
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-gray-900 hover:bg-gray-800 text-white shadow-sm hover:shadow-md"
                            }`}
                    >
                        <span>{loading ? "Checking..." : "🔍 Check Health"}</span>
                    </button>

                    <label className="flex items-center gap-2 cursor-pointer text-gray-600 hover:text-gray-900 transition">
                        <input
                            type="checkbox"
                            checked={autoRefresh}
                            onChange={(e) => setAutoRefresh(e.target.checked)}
                            className="w-4 h-4 rounded border border-gray-300"
                        />
                        <span className="text-sm font-medium">Auto-refresh</span>
                    </label>

                    {lastCheck && (
                        <p className="text-gray-400 text-xs">
                            Last checked: <span className="font-medium text-gray-600">{lastCheck}</span>
                        </p>
                    )}
                </div>

                {/* Services Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
                    {services.map((service) => (
                        <div
                            key={service.name}
                            className="border border-gray-200 rounded-lg p-5 transition-all duration-300 hover:border-gray-400 hover:shadow-sm bg-gray-50"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <p className="text-2xl mb-2">{service.icon}</p>
                                    <p className="text-sm font-medium text-gray-900">{service.name}</p>
                                </div>
                                <div
                                    className={`w-2.5 h-2.5 rounded-full ${getStatusBadgeColor(service.status)} ${service.status !== "-" ? "animate-pulse" : ""}`}
                                />
                            </div>

                            <div className="space-y-3 pt-3 border-t border-gray-200">
                                <div>
                                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-2">Status</p>
                                    <p className="text-xl font-semibold text-gray-900">
                                        {service.status === "-"
                                            ? "—"
                                            : service.status === "ok" || service.status === "SERVING"
                                                ? "✅ Active"
                                                : "❌ Offline"}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Response</p>
                                    <p className="font-mono text-xs text-gray-600 break-words">
                                        {service.status === "-" ? "Not checked" : service.status}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Summary */}
                <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                    <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wide mb-6">📊 Summary</h3>
                    <div className="grid grid-cols-3 gap-6">
                        <div className="text-center border-r border-gray-200 last:border-r-0">
                            <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Healthy</p>
                            <p className="text-3xl font-light text-green-600">
                                {services.filter((s) => s.status === "ok" || s.status === "SERVING").length}
                            </p>
                        </div>
                        <div className="text-center border-r border-gray-200 last:border-r-0">
                            <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Offline</p>
                            <p className="text-3xl font-light text-red-600">
                                {services.filter((s) => s.status.includes("unreachable")).length}
                            </p>
                        </div>
                        <div className="text-center">
                            <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Unknown</p>
                            <p className="text-3xl font-light text-gray-400">
                                {services.filter((s) => s.status === "-").length}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Health;