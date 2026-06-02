interface Service {
    name: string;
    status: string;
    icon: string;
}

const ServiceCard = ({ service }: { service: Service }) => {
    const isOnline = service.status === "ok" || service.status === "SERVING";
    const isOffline = service.status.includes("unreachable");
    const isDown = service.status === "down";

    const state = isOnline
        ? "Online"
        : isDown
        ? "Down"
        : "Offline";

    const color = isOnline
        ? "bg-emerald-500"
        : isDown
        ? "bg-red-600"
        : "bg-gray-400";

    return (
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition">
            
            <div className="flex items-center justify-between">
                
                <div className="flex items-center gap-3">
                    <div className="text-2xl">{service.icon}</div>

                    <h3 className="text-sm font-semibold text-gray-900">
                        {service.name}
                    </h3>
                </div>

                <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
                    <span className="text-xs font-medium text-gray-600">
                        {state}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default ServiceCard;