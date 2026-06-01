export const formatConfidence = (value?: number) => {
    if (typeof value !== "number") {
        return "—";
    }

    return `${Math.round(value * 100)}%`;
};