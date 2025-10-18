'use client';

import { useState, useEffect } from 'react';
import { Save, User, Shield, Bell, Globe, Database, Info } from 'lucide-react';
import { useSession } from 'next-auth/react';

export default function SettingsPage() {
  const { data: session } = useSession();
  const [isSaving, setIsSaving] = useState(false);

  const [settings, setSettings] = useState({
    // General Settings
    siteName: 'SRT Timetable',
    siteDescription: 'Thailand Railway Timetable System',
    defaultLanguage: 'th',
    enableMultiLanguage: true,

    // Notifications
    emailNotifications: true,
    systemAlerts: true,
    maintenanceMode: false,

    // API Settings
    apiRateLimit: 100,
    enableApiDocs: true,
    enableCaching: true,

    // Security
    sessionTimeout: 30,
    requireStrongPassword: true,
    enableTwoFactor: false,
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    // Simulate save
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setIsSaving(false);
    alert('Settings saved successfully!');
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Configure system settings and preferences</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* General Settings */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <Info className="h-5 w-5 text-indigo-600" />
            <h2 className="text-lg font-semibold text-gray-900">General Settings</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Site Name</label>
              <input
                type="text"
                value={settings.siteName}
                onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Default Language
              </label>
              <select
                value={settings.defaultLanguage}
                onChange={(e) => setSettings({ ...settings, defaultLanguage: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="th">Thai</option>
                <option value="en">English</option>
                <option value="cn">Chinese</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Site Description
              </label>
              <textarea
                rows={3}
                value={settings.siteDescription}
                onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.enableMultiLanguage}
                  onChange={(e) =>
                    setSettings({ ...settings, enableMultiLanguage: e.target.checked })
                  }
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-700">Enable Multi-language Support</span>
              </label>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="h-5 w-5 text-purple-600" />
            <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
          </div>
          <div className="space-y-3">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={(e) =>
                  setSettings({ ...settings, emailNotifications: e.target.checked })
                }
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-700">Enable Email Notifications</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.systemAlerts}
                onChange={(e) => setSettings({ ...settings, systemAlerts: e.target.checked })}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-700">Enable System Alerts</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.maintenanceMode}
                onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                className="rounded border-gray-300 text-red-600 focus:ring-red-500"
              />
              <span className="text-sm text-gray-700">
                Maintenance Mode{' '}
                <span className="text-red-500">(Disables public access)</span>
              </span>
            </label>
          </div>
        </div>

        {/* API Settings */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <Database className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">API Settings</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API Rate Limit (requests/minute)
              </label>
              <input
                type="number"
                value={settings.apiRateLimit}
                onChange={(e) =>
                  setSettings({ ...settings, apiRateLimit: parseInt(e.target.value) })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="md:col-span-2 space-y-3">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.enableApiDocs}
                  onChange={(e) => setSettings({ ...settings, enableApiDocs: e.target.checked })}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-700">Enable API Documentation</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.enableCaching}
                  onChange={(e) => setSettings({ ...settings, enableCaching: e.target.checked })}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-700">Enable Response Caching</span>
              </label>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="h-5 w-5 text-green-600" />
            <h2 className="text-lg font-semibold text-gray-900">Security</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Session Timeout (minutes)
              </label>
              <input
                type="number"
                value={settings.sessionTimeout}
                onChange={(e) =>
                  setSettings({ ...settings, sessionTimeout: parseInt(e.target.value) })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="md:col-span-2 space-y-3">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.requireStrongPassword}
                  onChange={(e) =>
                    setSettings({ ...settings, requireStrongPassword: e.target.checked })
                  }
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-700">Require Strong Passwords</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.enableTwoFactor}
                  onChange={(e) => setSettings({ ...settings, enableTwoFactor: e.target.checked })}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-700">
                  Enable Two-Factor Authentication{' '}
                  <span className="text-gray-500">(Coming Soon)</span>
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Current User Info */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center gap-2 mb-4">
            <User className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Current User</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-indigo-100 text-sm">Username</p>
              <p className="font-semibold">{session?.user?.username || 'admin'}</p>
            </div>
            <div>
              <p className="text-indigo-100 text-sm">Full Name</p>
              <p className="font-semibold">{session?.user?.fullName || 'Administrator'}</p>
            </div>
            <div>
              <p className="text-indigo-100 text-sm">Role</p>
              <p className="font-semibold">
                {typeof session?.user?.role === 'string'
                  ? session.user.role
                  : session?.user?.role?.name || 'admin'}
              </p>
            </div>
            <div>
              <p className="text-indigo-100 text-sm">Status</p>
              <p className="font-semibold">Active</p>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end gap-4">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            <Save className="h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
