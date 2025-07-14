// In packages/client/src/context/AuthContext.tsx
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';

interface AuthUser {
    userId: string;
    email: string;
}

interface AuthContextType {
    user: AuthUser | null;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, isLoading: true });

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (token) {
            try {
                const decodedToken: AuthUser = jwtDecode(token);
                setUser(decodedToken);
            } catch (error) {
                console.error('Invalid token:', error);
                localStorage.removeItem('authToken');
                setUser(null);
            }
        }
        setIsLoading(false);
    }, []);

    return (
        <AuthContext.Provider value={{ user, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
