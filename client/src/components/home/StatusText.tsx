type Props = {
    listening: boolean;
};

const StatusText = ({ listening }: Props) => {
    return (
        <div className="mt-8 text-xl text-gray-300">
            {listening
                ? "Listening..."
                : "Waiting..."}
        </div>
    );
};

export default StatusText;