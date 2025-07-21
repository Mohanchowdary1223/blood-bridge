'use client';

import { useRouter } from 'next/navigation';

export default function AdminNavbar() {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    localStorage.clear();
    router.push('/login');
  };

  return (
    <nav className="bg-indigo-700 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <h1 className="text-2xl font-bold">Admin Panel</h1>
            <div className="hidden md:flex space-x-4">
              <button
                onClick={() => router.push('/admin')}
                className="px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-600"
              >
                Dashboard
              </button>
              <button
                onClick={() => router.push('/admin/users')}
                className="px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-600"
              >
                Users
              </button>
              <button
                onClick={() => router.push('/admin/donors')}
                className="px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-600"
              >
                Donors
              </button>
            </div>
          </div>
          <div className="flex items-center">
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium bg-red-600 rounded hover:bg-red-700 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
} 