'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

interface StationForm {
  stationCode: string;
  nameTh: string;
  nameEn: string;
  nameCn?: string;
  provinceNameTh?: string;
  provinceNameEn?: string;
  distanceForPricing?: number;
  distanceActual?: number;
  latitude?: number;
  longitude?: number;
  isActive: boolean;
}

export default function StationFormPage() {
  const router = useRouter();
  const params = useParams();
  const isEdit = params.id !== 'new';
  const stationId = isEdit ? parseInt(params.id as string) : null;

  const [form, setForm] = useState<StationForm>({
    stationCode: '',
    nameTh: '',
    nameEn: '',
    nameCn: '',
    provinceNameTh: '',
    provinceNameEn: '',
    distanceForPricing: 0,
    distanceActual: 0,
    latitude: 0,
    longitude: 0,
    isActive: true,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isEdit && stationId) {
      fetchStation();
    }
  }, [stationId]);

  const fetchStation = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/stations/${stationId}`);
      const data = await response.json();
      if (data.success) {
        setForm(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch station:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const url = isEdit ? `/api/stations/${stationId}` : '/api/stations';
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (response.ok) {
        router.push('/admin/stations');
      } else {
        alert('Failed to save station');
      }
    } catch (error) {
      console.error('Failed to save station:', error);
      alert('Failed to save station');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/admin/stations"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Stations
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEdit ? 'Edit Station' : 'Add New Station'}
        </h1>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Station Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Station Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={form.stationCode}
                onChange={(e) => setForm({ ...form, stationCode: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g., BKK"
              />
            </div>

            {/* Active Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={form.isActive ? 'true' : 'false'}
                onChange={(e) => setForm({ ...form, isActive: e.target.value === 'true' })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>

            {/* Thai Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Thai Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={form.nameTh}
                onChange={(e) => setForm({ ...form, nameTh: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="กรุงเทพ"
              />
            </div>

            {/* English Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                English Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={form.nameEn}
                onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="Bangkok"
              />
            </div>

            {/* Chinese Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chinese Name
              </label>
              <input
                type="text"
                value={form.nameCn || ''}
                onChange={(e) => setForm({ ...form, nameCn: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="曼谷"
              />
            </div>

            {/* Province Thai */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Province (Thai)
              </label>
              <input
                type="text"
                value={form.provinceNameTh || ''}
                onChange={(e) => setForm({ ...form, provinceNameTh: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="กรุงเทพมหานคร"
              />
            </div>

            {/* Province English */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Province (English)
              </label>
              <input
                type="text"
                value={form.provinceNameEn || ''}
                onChange={(e) => setForm({ ...form, provinceNameEn: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="Bangkok"
              />
            </div>
          </div>
        </div>

        {/* Distance & Location */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Distance & Location</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Distance for Pricing */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Distance for Pricing (km)
              </label>
              <input
                type="number"
                step="0.01"
                value={form.distanceForPricing || ''}
                onChange={(e) =>
                  setForm({ ...form, distanceForPricing: parseFloat(e.target.value) })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Distance Actual */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Actual Distance (km)
              </label>
              <input
                type="number"
                step="0.01"
                value={form.distanceActual || ''}
                onChange={(e) =>
                  setForm({ ...form, distanceActual: parseFloat(e.target.value) })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Latitude */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Latitude</label>
              <input
                type="number"
                step="0.000001"
                value={form.latitude || ''}
                onChange={(e) => setForm({ ...form, latitude: parseFloat(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Longitude */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Longitude</label>
              <input
                type="number"
                step="0.000001"
                value={form.longitude || ''}
                onChange={(e) => setForm({ ...form, longitude: parseFloat(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Link
            href="/admin/stations"
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save Station'}
          </button>
        </div>
      </form>
    </div>
  );
}
