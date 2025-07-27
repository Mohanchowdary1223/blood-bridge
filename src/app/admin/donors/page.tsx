'use client';

import AdminLayout from '@/components/admin/admin-layout';
import AdminDonors from '@/components/admin/admin-donors';

export default function AdminPage() {
  return (
    <AdminLayout>
      <AdminDonors />
    </AdminLayout>
  );
} 