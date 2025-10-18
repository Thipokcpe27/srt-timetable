'use client';

import { useSession, signOut } from 'next-auth/react';
import { Bell, User, LogOut, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export default function AdminTopBar() {
  const { data: session } = useSession();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/admin/login' });
  };

  return (
    <div className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 lg:px-8">
      {/* Left side - Page title will be inserted by page */}
      <div className="flex items-center gap-4">
        <div className="hidden lg:block">
          <h1 className="text-xl font-semibold text-gray-900">Admin Panel</h1>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button className="relative p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
        </button>

        {/* User menu */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="hidden md:block text-right">
              <p className="text-sm font-medium text-gray-900">
                {session?.user?.fullName || 'Admin User'}
              </p>
              <p className="text-xs text-gray-500">{session?.user?.role?.code || 'ADMIN'}</p>
            </div>
            <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center">
              <User className="h-5 w-5 text-white" />
            </div>
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </button>

          {/* Dropdown menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900">
                  {session?.user?.fullName || 'Admin User'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {session?.user?.email || 'admin@example.com'}
                </p>
              </div>

              <div className="py-2">
                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    // Add profile navigation here
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <User className="h-4 w-4" />
                  Your Profile
                </button>

                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
