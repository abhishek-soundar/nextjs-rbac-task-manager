
import Link from 'next/link';

export default function UnauthorizedPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-md w-full">
                <h1 className="text-4xl font-bold text-red-600 mb-4">403</h1>
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Access Denied</h2>
                <p className="text-gray-600 mb-8">
                    You do not have permission to view this page. This area is restricted to administrators only.
                </p>
                <Link
                    href="/dashboard"
                    className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                >
                    Return to Dashboard
                </Link>
                <div className="mt-4">
                    <Link href="/login" className="text-sm text-gray-500 hover:text-gray-700 underline">
                        Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
}
