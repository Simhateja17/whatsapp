// In packages/client/src/components/MessageList.tsx
import React from 'react';
import MessageBubble from './MessageBubble';
import Timestamp from './Timestamp';
import { useAuth } from '@/context/AuthContext';
import { format } from 'date-fns'; // <<< IMPORT FORMAT FUNCTION

export interface Message {
  id: string;
  content: string;
  authorId: string;
  createdAt: string;
}

interface MessageListProps {
    messages: Message[];
}

export default function MessageList({ messages }: MessageListProps) {
    const { user } = useAuth();
    let lastShownDate: string | null = null; // Variable to track the last date shown

    if (!user) return <div className="flex-grow p-4">Loading user...</div>;

    return (
        <div className="flex-grow p-4 overflow-y-auto flex flex-col gap-3 min-h-0">
            {messages.map((msg) => {
                const messageDate = new Date(msg.createdAt);
                // Format the date to a simple string like "2023-10-27"
                const currentDateStr = format(messageDate, 'yyyy-MM-dd');
                let showTimestamp = false;

                // If the date of this message is different from the last one we showed,
                // we need to render a new timestamp.
                if (currentDateStr !== lastShownDate) {
                    showTimestamp = true;
                    lastShownDate = currentDateStr;
                }

                return (
                    // Use a Fragment to group the optional timestamp and the message bubble
                    <React.Fragment key={msg.id}>
                        {showTimestamp && (
                            <Timestamp time={format(messageDate, 'MMM d, yyyy')} />
                        )}
                        <MessageBubble 
                            text={msg.content}
                            isSender={msg.authorId === user.userId}
                        />
                    </React.Fragment>
                );
            })}
        </div>
    );
}
