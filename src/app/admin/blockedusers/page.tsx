'use client';

import AdminLayout from '@/components/admin/admin-layout';
import AdminBlockedUsers from '@/components/admin/admin-blockedusers';

export default function AdminPage() {
  return (
    <AdminLayout>
      <AdminBlockedUsers />
    </AdminLayout>
  );
} 