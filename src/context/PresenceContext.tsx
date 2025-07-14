// In packages/client/src/context/PresenceContext.tsx
'use client';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import io, { Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface PresenceState {
    [userId: string]: { isOnline: boolean; lastSeen?: string };
}
const PresenceContext = createContext<PresenceState>({});

export const PresenceProvider = ({ children }: { children: ReactNode }) => {
    const { user } = useAuth();
    const [presence, setPresence] = useState<PresenceState>({});

    useEffect(() => {
        if (!user) return;

        const socket: Socket = io(process.env.NEXT_PUBLIC_API_URL!);
        
        // 1. Tell the server we are connected
        socket.on('connect', () => {
            socket.emit('userConnected', user.userId);
        });

        // 2. Listen for status changes from other users
        socket.on('userStatusChanged', ({ userId, isOnline, lastSeen }) => {
            setPresence(prev => ({ ...prev, [userId]: { isOnline, lastSeen } }));
        });

        return () => {
            socket.disconnect();
        };
    }, [user]);

    return (
        <PresenceContext.Provider value={presence}>
            {children}
        </PresenceContext.Provider>
    );
};

export const usePresence = () => useContext(PresenceContext);
