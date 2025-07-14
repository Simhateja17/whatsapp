// In packages/client/src/app/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Search, User } from 'lucide-react';
import ConversationListItem from '@/components/ConversationListItem';

// Define types for our data structures
interface FoundUser {
    id: string;
    username: string;
    email: string;
    profilePicUrl: string | null;
}
interface Conversation {
    id: string;
    members: { id: string; username: string; profilePicUrl: string | null }[];
    messages: { content: string; authorId: string; }[];
}

export default function HomePage() {
    const { user } = useAuth();
    const router = useRouter();

    // State for both features
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [isLoadingChats, setIsLoadingChats] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<FoundUser[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    // Effect for auth check and fetching initial conversations
    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            router.replace('/auth/signin');
            return;
        }
        if (user) {
            setIsLoadingChats(true);
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/conversations/user/${user.userId}`)
                .then(res => res.json())
                .then(data => {
                    setConversations(data);
                }).finally(() => {
                    setIsLoadingChats(false);
                });
        }
    }, [user, router]);
    
    // Effect for handling debounced user search
    useEffect(() => {
        if (searchQuery.trim() === '') {
            setSearchResults([]);
            setIsSearching(false);
            return;
        }

        setIsSearching(true);
        const searchUsers = async () => {
            if (!user) return;
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/search?query=${searchQuery}&currentUserId=${user.userId}`);
            const data = await res.json();
            setSearchResults(data);
            setIsSearching(false);
        };

        const timeoutId = setTimeout(searchUsers, 500); // 500ms debounce
        return () => clearTimeout(timeoutId);
    }, [searchQuery, user]);

    // Handler to start a chat from search results
    const handleUserClick = async (targetUser: FoundUser) => {
        if (!user) return;
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/conversations/initiate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId1: user.userId, userId2: targetUser.id }),
        });
        const conversation = await res.json();
        router.push(`/chat/${conversation.id}`);
    };
    
    // --- Main Render Logic ---

    const renderContent = () => {
        // If there's a search query, show search results
        if (searchQuery.trim() !== '') {
            if (isSearching) {
                return <p className="text-zinc-400 text-center mt-10">Searching...</p>;
            }
            if (searchResults.length > 0) {
                return (
                    <ul className="flex flex-col gap-2">
                        {searchResults.map((foundUser) => (
                            <li key={foundUser.id} onClick={() => handleUserClick(foundUser)} className="flex items-center gap-4 p-2 rounded-lg hover:bg-zinc-800 cursor-pointer">
                                <div className="w-12 h-12 bg-zinc-700 rounded-full flex items-center justify-center overflow-hidden">
                                    {/* --- MODIFIED AVATAR LOGIC --- */}
                                    {foundUser.profilePicUrl ? (
                                        <img src={foundUser.profilePicUrl} alt={foundUser.username} className="w-full h-full object-cover" />
                                    ) : (
                                        <User className="text-zinc-400" />
                                    )}
                                </div>
                                <div>
                                    <p className="font-semibold">{foundUser.username}</p>
                                    <p className="text-sm text-zinc-400">{foundUser.email}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                );
            }
            return <p className="text-zinc-400 text-center mt-10">No users found.</p>;
        }

        // Otherwise, show the conversation list
        if (isLoadingChats) {
             return <p className="text-zinc-400 text-center mt-10">Loading chats...</p>;
        }
        if (conversations.length > 0) {
            return (
                <ul className="flex flex-col gap-2">
                    {conversations.map((convo) => (
                        <ConversationListItem key={convo.id} conversation={convo} />
                    ))}
                </ul>
            );
        }
        return <p className="text-zinc-400 text-center mt-10">No conversations yet. Search for a user to start chatting!</p>;
    };

    return (
        <main className="flex items-center justify-center min-h-screen bg-zinc-800">
            <div className="flex flex-col w-full max-w-[450px] aspect-[9/16] bg-black text-white rounded-lg shadow-2xl overflow-hidden">
                <div className="p-4 border-b border-zinc-800">
                    <h1 className="text-xl font-bold text-center mb-4">Messages</h1>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
                        <input
                            type="text"
                            placeholder="Search"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-zinc-900 rounded-md py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>
                <div className="flex-grow p-2 overflow-y-auto">
                    {renderContent()}
                </div>
            </div>
        </main>
    );
}
