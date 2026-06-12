type Props = {
    volume: number;
    listening: boolean;
};

const VoiceOrb = ({ volume, listening }: Props) => {
    const scale = 1 + Math.min(volume / 80, 0.8);

    return (
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2">
            <div
                className="relative flex items-center justify-center"
                style={{
                    width: 160,
                    height: 160,
                    transform: `scale(${scale})`,
                    transition: "transform 80ms ease-out",
                }}
            >
                <div
                    className={`absolute inset-0 rounded-full blur-3xl transition-colors ${
                        listening
                            ? "bg-green-400/30"
                            : "bg-blue-400/20"
                    }`}
                />

                <div
                    className={`absolute inset-0 rounded-full border transition-colors ${
                        listening
                            ? "border-green-400"
                            : "border-blue-400"
                    }`}
                />

                <div
                    className={`h-24 w-24 rounded-full transition-colors shadow-lg ${
                        listening
                            ? "bg-green-400"
                            : "bg-blue-500"
                    }`}
                />
            </div>
        </div>
    );
};

export default VoiceOrb;