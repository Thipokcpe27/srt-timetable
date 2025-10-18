'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Edit, Trash2, MapPin, ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';

interface DistanceFareRange {
  id: number;
  minDistance: string;
  maxDistance: string | null;
  farePerKm: string;
  sortOrder: number;
}

interface DistanceFare {
  id: number;
  code: string;
  nameTh: string;
  nameEn: string;
  description: string | null;
  isActive: boolean;
  ranges: DistanceFareRange[];
}

export default function DistanceFaresPage() {
  const [fares, setFares] = useState<DistanceFare[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const [newFare, setNewFare] = useState({
    code: '',
    nameTh: '',
    nameEn: '',
    description: '',
    isActive: true,
  });

  useEffect(() => {
    fetchFares();
  }, []);

  const fetchFares = async () => {
    try {
      const response = await fetch('/api/pricing/distance-fares');
      const data = await response.json();
      if (data.success) {
        setFares(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch distance fares:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddFare = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/pricing/distance-fares', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newFare),
      });

      if (response.ok) {
        fetchFares();
        setShowAddForm(false);
        setNewFare({
          code: '',
          nameTh: '',
          nameEn: '',
          description: '',
          isActive: true,
        });
      }
    } catch (error) {
      console.error('Failed to add distance fare:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this distance fare?')) return;

    try {
      const response = await fetch(`/api/pricing/distance-fares/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchFares();
      }
    } catch (error) {
      console.error('Failed to delete distance fare:', error);
    }
  };

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const formatDistance = (distance: string | null) => {
    if (!distance) return '∞';
    return `${parseFloat(distance)} km`;
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
      <div className="mb-6">
        <Link
          href="/admin/pricing"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Pricing
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Distance Fares</h1>
            <p className="text-gray-600 mt-1">Configure distance-based fare calculation</p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Plus className="h-4 w-4" />
            Add Distance Fare
          </button>
        </div>
      </div>

      {/* Add Fare Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Add Distance Fare</h2>
          <form onSubmit={handleAddFare} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={newFare.code}
                onChange={(e) => setNewFare({ ...newFare, code: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder="DISTANCE_STD"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name (Thai) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={newFare.nameTh}
                onChange={(e) => setNewFare({ ...newFare, nameTh: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder="ค่าโดยสารตามระยะทางมาตรฐาน"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name (English) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={newFare.nameEn}
                onChange={(e) => setNewFare({ ...newFare, nameEn: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder="Standard Distance Fare"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 mt-8">
                <input
                  type="checkbox"
                  checked={newFare.isActive}
                  onChange={(e) => setNewFare({ ...newFare, isActive: e.target.checked })}
                  className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <span className="text-sm text-gray-700">Active</span>
              </label>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                rows={2}
                value={newFare.description}
                onChange={(e) => setNewFare({ ...newFare, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder="Optional description..."
              />
            </div>

            <div className="md:col-span-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Add Fare
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Fares List */}
      <div className="space-y-4">
        {fares.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <MapPin className="h-12 w-12 mx-auto text-gray-300 mb-2" />
            <p className="text-gray-500">No distance fares configured</p>
          </div>
        ) : (
          fares.map((fare) => (
            <div key={fare.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
              {/* Fare Header */}
              <div
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50"
                onClick={() => toggleExpand(fare.id)}
              >
                <div className="flex items-center gap-4">
                  <div className="bg-green-100 text-green-600 rounded-lg p-3">
                    <MapPin className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{fare.nameTh}</h3>
                    <p className="text-sm text-gray-500">
                      {fare.nameEn} • {fare.ranges.length} range(s)
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-medium rounded ${
                      fare.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {fare.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/pricing/distance-fares/${fare.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="text-green-600 hover:text-green-900"
                    >
                      <Edit className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(fare.id);
                      }}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  {expandedId === fare.id ? (
                    <ChevronUp className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  )}
                </div>
              </div>

              {/* Fare Ranges (Expandable) */}
              {expandedId === fare.id && (
                <div className="border-t border-gray-200 p-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-gray-700">Distance Ranges</h4>
                    <Link
                      href={`/admin/pricing/distance-fares/${fare.id}/ranges/new`}
                      className="text-xs text-green-600 hover:text-green-700 font-medium"
                    >
                      + Add Range
                    </Link>
                  </div>
                  {fare.ranges.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No ranges configured yet
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {fare.ranges
                        .sort((a, b) => a.sortOrder - b.sortOrder)
                        .map((range) => (
                          <div
                            key={range.id}
                            className="bg-white rounded-lg p-3 flex items-center justify-between"
                          >
                            <div className="flex items-center gap-4">
                              <span className="text-xs font-medium text-gray-500 w-12">
                                #{range.sortOrder}
                              </span>
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {formatDistance(range.minDistance)} -{' '}
                                  {formatDistance(range.maxDistance)}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="text-sm font-semibold text-green-600">
                                ฿{parseFloat(range.farePerKm).toFixed(2)}/km
                              </span>
                              <Link
                                href={`/admin/pricing/distance-fares/${fare.id}/ranges/${range.id}`}
                                className="text-green-600 hover:text-green-900"
                              >
                                <Edit className="h-3 w-3" />
                              </Link>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Info */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> Distance fares are calculated per kilometer. Each distance fare
          can have multiple ranges with different rates. The system automatically selects the
          appropriate range based on journey distance.
        </p>
      </div>
    </div>
  );
}
