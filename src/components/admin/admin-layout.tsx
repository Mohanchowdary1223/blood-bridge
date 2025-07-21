'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminNavbar from './admin-navbar';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
          throw new Error('No user found');
        }

        const user = JSON.parse(storedUser);
        if (user.role !== 'admin') {
          throw new Error('Not authorized');
        }

        const response = await fetch('/api/admin/profile', {
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to verify admin status');
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Auth error:', error);
        localStorage.clear();
        router.push('/login');
      }
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminNavbar />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
} 