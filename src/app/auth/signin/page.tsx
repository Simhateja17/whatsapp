// In packages/client/src/app/auth/signin/page.tsx
'use client';

import { useState, FormEvent } from 'react';
import emailjs from '@emailjs/browser';

export default function SignInPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    
    const handleRequestOtp = async (e: FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            // Step 1: Generate OTP on backend
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/request-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email }),
            });

            if (!res.ok) {
                const data = await res.json();
                setError(data.error || 'Failed to generate OTP.');
                setIsLoading(false);
                return;
            }

            const data = await res.json();
            
            // Step 2: Send email using EmailJS (client-side)
            const emailParams = {
                name: data.name,
                otp: data.otp,
                to_email: data.email, // EmailJS expects 'to_email' for recipient
            };

            await emailjs.send(
                process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
                process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!,
                emailParams,
                process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!
            );

            setIsOtpSent(true);
        } catch (error) {
            console.error('Error sending OTP:', error);
            setError('Failed to send OTP. Please try again.');
        }
        
        setIsLoading(false);
    };

    const handleVerifyOtp = async (e: FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/verify-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, otp }),
        });

        if (res.ok) {
            const data = await res.json();
            // Store token and redirect
            localStorage.setItem('authToken', data.token); 
            // Force a page reload to ensure proper authentication state
            window.location.href = '/'; // This will cause a full page reload
        } else {
            const data = await res.json();
            setError(data.error || 'Failed to verify OTP.');
        }
        setIsLoading(false);
    };

    return (
        <div className="flex items-center justify-center h-screen bg-black text-white">
            <div className="w-full max-w-sm p-8 space-y-6 bg-zinc-900 rounded-lg">
                <h1 className="text-2xl font-bold text-center">
                    {isOtpSent ? 'Enter OTP' : 'Sign In'}
                </h1>

                {!isOtpSent ? (
                    <form onSubmit={handleRequestOtp} className="space-y-4">
                        <div>
                            <label htmlFor="name" className="text-sm font-medium">Name</label>
                            <input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className="w-full px-3 py-2 mt-1 text-white bg-zinc-800 border border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label htmlFor="email" className="text-sm font-medium">Email</label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full px-3 py-2 mt-1 text-white bg-zinc-800 border border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-2 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Sending...' : 'Send OTP'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleVerifyOtp} className="space-y-4">
                        <p className="text-center text-sm text-zinc-400">
                            An OTP has been sent to {email}.
                        </p>
                        <div>
                            <label htmlFor="otp" className="text-sm font-medium">One-Time Password</label>
                            <input
                                id="otp"
                                type="text"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                required
                                className="w-full px-3 py-2 mt-1 text-white bg-zinc-800 border border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-2 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Verifying...' : 'Verify & Sign In'}
                        </button>
                    </form>
                )}

                {error && <p className="text-sm text-center text-red-500">{error}</p>}
            </div>
        </div>
    );
}
