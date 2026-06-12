type Props = {
    text: string;
};

const TranscriptBox = ({ text }: Props) => {
    if (!text) return null;

    return (
        <div className="mt-12 rounded-xl border border-white/10 bg-white/5 p-6 text-xl">
            {text}
        </div>
    );
};

export default TranscriptBox;