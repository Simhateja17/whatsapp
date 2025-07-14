// In packages/client/src/components/Timestamp.tsx
interface TimestampProps {
  time: string;
}

export default function Timestamp({ time }: TimestampProps) {
  return (
    <div className="text-center text-xs text-zinc-500 my-4">
      {time.toUpperCase()}
    </div>
  );
}
