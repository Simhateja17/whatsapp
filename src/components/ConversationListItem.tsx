// In packages/client/src/components/ConversationListItem.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { User } from 'lucide-react'; // Using a default icon
import { formatDistanceToNow } from 'date-fns';

// Define a type for the conversation prop
interface Conversation {
    id: string;
    members: { id: string; username: string; profilePicUrl: string | null }[];
    messages: { content: string; authorId: string; createdAt: string; }[];
}

interface ConversationListItemProps {
    conversation: Conversation;
}

export default function ConversationListItem({ conversation }: ConversationListItemProps) {
    const { user } = useAuth();
    const router = useRouter();

    if (!user) return null;

    // Find the other user in the conversation
    const otherUser = conversation.members.find(member => member.id !== user.userId);
    const lastMessage = conversation.messages[0];

    const handleItemClick = () => {
        router.push(`/chat/${conversation.id}`);
    };

    return (
        <li onClick={handleItemClick} className="flex items-center gap-4 p-2 rounded-lg hover:bg-zinc-800 cursor-pointer">
            <div className="w-14 h-14 bg-zinc-700 rounded-full flex items-center justify-center overflow-hidden">
                {/* --- MODIFIED AVATAR LOGIC --- */}
                {otherUser?.profilePicUrl ? (
                    <img src={otherUser.profilePicUrl} alt={otherUser.username} className="w-full h-full object-cover" />
                ) : (
                    <User className="text-zinc-400" size={30} />
                )}
            </div>
            <div className="flex-grow">
                <p className="font-semibold">{otherUser ? otherUser.username : 'Unknown User'}</p>
                {lastMessage && (
                    <div className="flex items-center gap-2 text-sm text-zinc-400">
                        <p className="truncate">
                            {lastMessage.authorId === user.userId ? 'You: ' : ''}
                            {lastMessage.content}
                        </p>
                        <span className="font-medium text-nowrap">
                            · {formatDistanceToNow(new Date(lastMessage.createdAt), { addSuffix: false })}
                        </span>
                    </div>
                )}
            </div>
        </li>
    );
}
