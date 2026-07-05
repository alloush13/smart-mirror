import { memo } from "react";

type Props = {
  listening: boolean;
};

const StatusText = ({ listening }: Props) => {
  const text = listening ? "Listening..." : "Waiting...";

  return (
    <div className="mt-8 text-xl text-gray-300">
      {text}
    </div>
  );
};

export default memo(StatusText);