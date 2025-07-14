// In packages/client/src/app/chat/[conversationId]/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation'; // Import useParams to get URL params
import io, { Socket } from 'socket.io-client';
import ChatHeader from '@/components/ChatHeader';
import MessageList, { Message } from '@/components/MessageList';
import MessageInput from '@/components/MessageInput';
import { useAuth } from '@/context/AuthContext';

// Define a type for the other user's data
interface OtherUser {
    id: string;
    username: string;
}

export default function ChatPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [otherUser, setOtherUser] = useState<OtherUser | null>(null); // <<< NEW STATE
    const { user } = useAuth();
    const socketRef = useRef<Socket | null>(null);
    const params = useParams(); // Get URL params
    const conversationId = params.conversationId as string; // Extract conversationId

    useEffect(() => {
        if (!user || !conversationId) return;

        // --- FETCH CONVERSATION DETAILS (NEW LOGIC) ---
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/conversations/${conversationId}`)
            .then(res => res.json())
            .then(data => {
                // Find the member of the conversation who is NOT the logged-in user
                const partner = data.members.find((member: OtherUser) => member.id !== user.userId);
                setOtherUser(partner);
            })
            .catch(err => console.error("Failed to fetch conversation details:", err));
        
        // --- The rest of the useEffect remains the same ---
        const socket = io(process.env.NEXT_PUBLIC_API_URL!);
        socketRef.current = socket;

        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/conversations/${conversationId}/messages`)
            .then(res => res.json())
            .then(data => setMessages(data))
            .catch(err => console.error("Failed to fetch messages:", err));
        
        socket.emit('joinConversation', conversationId);

        socket.on('newMessage', (newMessage: Message) => {
            setMessages((prevMessages) => [...prevMessages, newMessage]);
        });

        return () => {
            socket.disconnect();
        };
    }, [user, conversationId]);

    const handleSendMessage = (content: string) => {
        if (!user || !socketRef.current || !conversationId) return;

        const messageData = {
            conversationId: conversationId,
            authorId: user.userId,
            content: content,
        };
        socketRef.current.emit('sendMessage', messageData);
    };

    return (
        <main className="flex items-center justify-center min-h-screen bg-zinc-800 p-4">
            <div className="flex flex-col w-full max-w-md h-[100vh] max-h-[900px] bg-black text-white rounded-lg shadow-2xl overflow-hidden">
                {/* Pass the other user data down to the header */}
                <ChatHeader partner={otherUser} />
                <MessageList messages={messages} />
                <MessageInput onSendMessage={handleSendMessage} />
            </div>
        </main>
    );
}
