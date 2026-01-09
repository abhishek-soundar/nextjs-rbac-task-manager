
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function DashboardPage() {
    const [user, setUser] = useState<{ email: string; role: string } | null>(null);
    const [tasks, setTasks] = useState<any[]>([]);
    const [loadingTasks, setLoadingTasks] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const res = await fetch('/api/auth/me');
                if (res.ok) {
                    const data = await res.json();
                    setUser(data.user || data); // Handle potential structure diff
                } else {
                    throw new Error('Not authenticated');
                }
            } catch (e) {
                router.push('/login');
            }
        };

        fetchUserData();
    }, [router]);

    useEffect(() => {
        if (!user) return;

        const fetchTasks = async () => {
            try {
                const res = await fetch('/api/tasks/my');
                if (res.ok) {
                    setTasks(await res.json());
                }
            } catch (e) {
                console.error("Failed to fetch tasks");
            } finally {
                setLoadingTasks(false);
            }
        };

        fetchTasks();
    }, [user]);

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        router.push('/login');
        router.refresh();
    };

    if (!user) return <div className="p-8">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
                    <div className="space-x-4">
                        {user.role === 'ADMIN' && (
                            <Link href="/admin/tasks" className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">
                                Manage Tasks
                            </Link>
                        )}
                        <button
                            onClick={handleLogout}
                            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                        >
                            Logout
                        </button>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                    <p className="text-lg mb-2 text-gray-700">Welcome, <strong>{user.email}</strong>!</p>
                    <p className="text-gray-600">Your role is: <span className="inline-block px-2 py-1 text-xs font-semibold tracking-wide text-indigo-800 uppercase bg-indigo-100 rounded-full">{user.role}</span></p>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-bold mb-4">My Assigned Tasks</h2>
                    {loadingTasks ? (
                        <p>Loading tasks...</p>
                    ) : tasks.length === 0 ? (
                        <p className="text-gray-500">No tasks assigned yet.</p>
                    ) : (
                        <div className="space-y-4">
                            {tasks.map(task => (
                                <div key={task._id} className="border p-4 rounded hover:bg-gray-50">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-semibold text-lg">{task.title}</h3>
                                            <p className="text-gray-600 mt-1">{task.description}</p>
                                        </div>
                                        <span className={`px-2 py-1 text-xs rounded-full ${task.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {task.status}
                                        </span>
                                    </div>
                                    <div className="mt-2 text-xs text-gray-400">
                                        Assigned by: {task.createdBy?.email}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
