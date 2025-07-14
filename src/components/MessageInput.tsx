// In packages/client/src/components/MessageInput.tsx
import { Camera, Mic, Image as ImageIcon, PlusCircle } from 'lucide-react';
import { useState, FormEvent } from 'react';

interface MessageInputProps {
    onSendMessage: (content: string) => void;
}

export default function MessageInput({ onSendMessage }: MessageInputProps) {
    const [content, setContent] = useState('');

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (content.trim()) {
            onSendMessage(content.trim());
            setContent('');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-3 flex items-center gap-2">
            {/* The camera icon isn't part of the form */}
            <div className="p-2 bg-blue-500 rounded-full cursor-pointer">
                <Camera size={24} className="text-white" />
            </div>
            <div className="flex-grow flex items-center bg-zinc-800 rounded-full px-4 py-2">
                <input 
                    type="text" 
                    placeholder="Message..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="flex-grow bg-transparent focus:outline-none text-white"
                />
                <div className="flex items-center gap-3">
                    <Mic size={22} className="text-zinc-400 cursor-pointer" />
                    <ImageIcon size={22} className="text-zinc-400 cursor-pointer" />
                    <PlusCircle size={22} className="text-zinc-400 cursor-pointer" />
                </div>
            </div>
        </form>
    );
}
