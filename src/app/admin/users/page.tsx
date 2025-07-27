'use client';

import AdminLayout from '@/components/admin/admin-layout';
import AdminUsers from '@/components/admin/admin-users';

export default function AdminPage() {
  return (
    <AdminLayout>
      <AdminUsers />
    </AdminLayout>
  );
} 