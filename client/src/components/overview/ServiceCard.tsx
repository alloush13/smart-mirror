interface Service {
    name: string;
    status: string;
    icon: string;
}

const ServiceCard = ({ service }: { service: Service }) => {
    const isOnline =
        service.status === "ok" || service.status === "SERVING";

    const isOffline = service.status.includes("unreachable");

    return (
        <div className="border rounded-lg p-5 bg-gray-50">
            <div className="flex justify-between">
                <span className="text-2xl">{service.icon}</span>
                <div
                    className={`w-2 h-2 rounded-full ${
                        isOnline
                            ? "bg-green-500"
                            : isOffline
                            ? "bg-red-500"
                            : "bg-gray-400"
                    }`}
                />
            </div>

            <h3 className="mt-3 font-medium">{service.name}</h3>

            <p className="text-sm mt-2">
                {isOnline ? "Active" : isOffline ? "Offline" : "Unknown"}
            </p>

            <p className="text-xs text-gray-500 mt-1">
                {service.status}
            </p>
        </div>
    );
};

export default ServiceCard;