interface Service {
    name: string;
    status: string;
    icon: string;
}

const HealthSummary = ({ services }: { services: Service[] }) => {
    return (
        <div className="border rounded-lg p-6 bg-gray-50">
            <h3 className="text-sm uppercase mb-4">Summary</h3>

            <div className="flex justify-between">
                <div>
                    Healthy:{" "}
                    {
                        services.filter(
                            (s) =>
                                s.status === "ok" ||
                                s.status === "SERVING"
                        ).length
                    }
                </div>

                <div>
                    Offline:{" "}
                    {
                        services.filter((s) =>
                            s.status.includes("unreachable")
                        ).length
                    }
                </div>

                <div>
                    Unknown:{" "}
                    {
                        services.filter((s) => s.status === "-").length
                    }
                </div>
            </div>
        </div>
    );
};

export default HealthSummary;