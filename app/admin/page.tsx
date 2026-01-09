
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminPage() {
    const [user, setUser] = useState<{ email: string; role: string } | null>(null);
    const router = useRouter();

    useEffect(() => {
        fetch('/api/auth/me')
            .then((res) => {
                if (res.ok) return res.json();
                throw new Error('Not authenticated');
            })
            .then((data) => {
                if (data.user.role !== 'ADMIN') {
                    router.push('/unauthorized');
                } else {
                    setUser(data.user);
                }
            })
            .catch(() => router.push('/login'));
    }, [router]);

    if (!user) return <div className="p-8">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-6 text-red-800">Admin Dashboard</h1>
                <div className="bg-white p-6 rounded-lg shadow-md mb-6 border-l-4 border-red-500">
                    <p className="text-lg mb-2 text-gray-700">Welcome, Super Admin <strong>{user.email}</strong>!</p>
                    <p className="text-gray-600">You have full access to the system.</p>
                </div>

                <Link href="/dashboard" className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">
                    Back to Dashboard
                </Link>
            </div>
        </div>
    );
}
