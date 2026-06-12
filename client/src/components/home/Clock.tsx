type Props = {
    time: Date;
};

const Clock = ({ time }: Props) => {
    return (
        <div className="text-7xl font-thin">
            {time.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
            })}
        </div>
    );
};

export default Clock;