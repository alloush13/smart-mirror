interface Props {
    loading: boolean;
    onCheck: () => void;
    lastCheck: string;
}

const HealthControls = ({
    loading,
    onCheck,
    lastCheck,
}: Props) => {
    return (
        <div className="mb-8 flex justify-between items-center border-b pb-6">
            <button
                onClick={onCheck}
                disabled={loading}
                className="px-6 py-2 bg-black text-white rounded-lg"
            >
                {loading ? "Checking..." : "Check Health"}
            </button>


            {lastCheck && (
                <span className="text-xs text-gray-500">
                    Last: {lastCheck}
                </span>
            )}
        </div>
    );
};

export default HealthControls;