type Props = {
  connected: boolean;
  active: boolean;
};

export default function ScreenBorder({
  connected,
  active,
}: Props) {
  let className = "border-disconnected";

  if (connected) {
    className = "animated-border";
  }

  if (active) {
    className = "glow-border";
  }

  return (
    <div className="pointer-events-none absolute inset-0 z-50">
      <div className={`h-full w-full ${className}`} />
    </div>
  );
}