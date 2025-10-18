'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Sparkles } from 'lucide-react';
import Link from 'next/link';

interface Amenity {
  id: number;
  code: string;
  nameTh: string;
  nameEn: string;
  nameCn: string;
  icon: string;
  isActive: boolean;
}

export default function AmenitiesPage() {
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/amenities')
      .then((res) => res.json())
      .then((data) => data.success && setAmenities(data.data))
      .finally(() => setIsLoading(false));
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this amenity?')) return;
    const res = await fetch(`/api/amenities/${id}`, { method: 'DELETE' });
    if (res.ok) setAmenities(amenities.filter((a) => a.id !== id));
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Amenities</h1>
          <p className="text-gray-600">Manage train amenities and facilities</p>
        </div>
        <Link
          href="/admin/amenities/new"
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          <Plus className="h-5 w-5" />
          Add Amenity
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Icon
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Code
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Name (TH)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Name (EN)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {amenities.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                  <Sparkles className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                  <p>No amenities</p>
                </td>
              </tr>
            ) : (
              amenities.map((amenity) => (
                <tr key={amenity.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <span className="text-2xl">{amenity.icon}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-mono text-gray-900">{amenity.code}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-gray-900">{amenity.nameTh}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-500">{amenity.nameEn}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded ${
                        amenity.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {amenity.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/amenities/${amenity.id}`}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(amenity.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
