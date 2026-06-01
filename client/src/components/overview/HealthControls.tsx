interface Props {
    loading: boolean;
    onCheck: () => void;
    autoRefresh: boolean;
    setAutoRefresh: (v: boolean) => void;
    lastCheck: string;
}

const HealthControls = ({
    loading,
    onCheck,
    autoRefresh,
    setAutoRefresh,
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

            <label className="flex items-center gap-2">
                <input
                    type="checkbox"
                    checked={autoRefresh}
                    onChange={(e) => setAutoRefresh(e.target.checked)}
                />
                Auto-refresh
            </label>

            {lastCheck && (
                <span className="text-xs text-gray-500">
                    Last: {lastCheck}
                </span>
            )}
        </div>
    );
};

export default HealthControls;