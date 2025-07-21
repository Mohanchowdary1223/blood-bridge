'use client';

import { useEffect, useState } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  phone: string;
}

export default function AdminDashboard() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const response = await fetch('/api/admin/profile', {
          credentials: 'include',
        });
        const data = await response.json();
        if (response.ok) {
          setUser(data.user);
        }
      } catch (error) {
        console.error('Failed to fetch admin data:', error);
      }
    };

    fetchAdminData();
  }, []);

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Welcome, {user.name}!
        </h2>
        <div className="border-t border-gray-200 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Admin Information</h3>
              <div className="space-y-2">
                <p><span className="font-medium">Email:</span> {user.email}</p>
                <p><span className="font-medium">Phone:</span> {user.phone}</p>
                <p><span className="font-medium">Role:</span> {user.role}</p>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition-colors">
                  View All Users
                </button>
                <button className="w-full bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition-colors">
                  Manage Donors
                </button>
                <button className="w-full bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition-colors">
                  View Statistics
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 