// In packages/client/src/components/MessageBubble.tsx
import { Heart } from 'lucide-react';

interface MessageBubbleProps {
  text: string;
  isSender: boolean;
  hasReaction?: boolean;
}

export default function MessageBubble({ text, isSender, hasReaction }: MessageBubbleProps) {
  const bubbleClasses = isSender
    ? 'bg-purple-600 text-white self-end rounded-2xl'
    : 'bg-zinc-800 text-white self-start rounded-2xl';
    
  return (
    <div className={`relative max-w-xs md:max-w-md ${isSender ? 'self-end' : 'self-start'}`}>
        <div className={`px-4 py-2 ${bubbleClasses}`}>
            <p>{text}</p>
        </div>
        {hasReaction && (
            <div className="absolute -bottom-3 -right-2 bg-zinc-700 rounded-full p-0.5">
                <Heart size={14} className="text-red-500 fill-current" />
            </div>
        )}
    </div>
  );
}
