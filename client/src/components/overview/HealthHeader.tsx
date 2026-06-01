interface HealthHeaderProps {
    socketConnected: boolean;
}

const HealthHeader = ({ socketConnected }: HealthHeaderProps) => {
    return (
        <div className="mb-12">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-light text-gray-900">
                        Health Status
                    </h1>

                    <p className="text-gray-500 text-sm uppercase mt-2">
                        Monitor your services
                    </p>

                    <div className="h-1 w-12 bg-gray-300 rounded-full mt-4"></div>
                </div>

                <div
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                        socketConnected
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                    }`}
                >
                    🔌 {socketConnected ? "Connected" : "Disconnected"}
                </div>
            </div>
        </div>
    );
};

export default HealthHeader;