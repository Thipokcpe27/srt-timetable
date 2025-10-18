/**
 * Admin Layout
 */

import { ReactNode } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminTopBar from '@/components/admin/AdminTopBar';

export const metadata = {
  title: 'Admin Panel - SRT Timetable',
  description: 'SRT Timetable Management System',
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <AdminSidebar />

        {/* Main content area */}
        <div className="flex-1 flex flex-col min-h-screen">
          {/* Top bar */}
          <AdminTopBar />

          {/* Page content */}
          <main className="flex-1 p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
