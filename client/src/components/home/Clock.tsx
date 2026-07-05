type Props = {
  time: Date;
};

const Clock = ({ time }: Props) => {
  const timeString = time.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  const dateString = time.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="text-center">
      <div className="text-[clamp(2rem,6vw,4rem)] font-thin">
        {timeString}
      </div>

      <div className="mt-2 text-[clamp(0.9rem,2vw,1.2rem)] text-gray-400">
        {dateString}
      </div>
    </div>
  );
};

export default Clock;