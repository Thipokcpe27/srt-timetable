'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  MapPin,
  Train,
  Package,
  Settings,
  DollarSign,
  Bell,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';
import { useState } from 'react';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Stations', href: '/admin/stations', icon: MapPin },
  { name: 'Trains', href: '/admin/trains', icon: Train },
  { name: 'Bogies', href: '/admin/bogies', icon: Package },
  { name: 'Amenities', href: '/admin/amenities', icon: Sparkles },
  { name: 'Pricing', href: '/admin/pricing', icon: DollarSign },
  { name: 'Announcements', href: '/admin/announcements', icon: Bell },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Mobile menu button */}
      <button
        type="button"
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-indigo-600 text-white"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Menu className="h-6 w-6" />
        )}
      </button>

      {/* Sidebar */}
      <div
        className={`
          fixed inset-y-0 left-0 z-40 w-64 bg-gray-900 transform transition-transform duration-200 ease-in-out
          lg:translate-x-0 lg:static
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-center h-16 bg-gray-800 border-b border-gray-700">
          <Link href="/admin/dashboard" className="flex items-center gap-2">
            <Train className="h-8 w-8 text-indigo-400" />
            <span className="text-xl font-bold text-white">SRT Admin</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="mt-8 px-4 space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                  ${
                    isActive
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }
                `}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Version info */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-gray-800 rounded-lg p-3">
            <p className="text-xs text-gray-400">Version 1.0.0</p>
            <p className="text-xs text-gray-500">Development</p>
          </div>
        </div>
      </div>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
}
