'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Edit, Trash2, Snowflake } from 'lucide-react';
import Link from 'next/link';

interface ACFare {
  id: number;
  class: number;
  minDistance: string;
  maxDistance: string | null;
  surcharge: string;
  effectiveDate: string;
  expiryDate: string | null;
  isActive: boolean;
}

export default function ACFaresPage() {
  const [fares, setFares] = useState<ACFare[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [filterClass, setFilterClass] = useState<number | 'all'>('all');

  const [newFare, setNewFare] = useState({
    class: 1,
    minDistance: '',
    maxDistance: '',
    surcharge: '',
    effectiveDate: new Date().toISOString().split('T')[0],
    expiryDate: '',
    isActive: true,
  });

  useEffect(() => {
    fetchFares();
  }, []);

  const fetchFares = async () => {
    try {
      const response = await fetch('/api/pricing/ac-fares');
      const data = await response.json();
      if (data.success) {
        setFares(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch AC fares:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddFare = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/pricing/ac-fares', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newFare,
          minDistance: parseFloat(newFare.minDistance),
          maxDistance: newFare.maxDistance ? parseFloat(newFare.maxDistance) : null,
          surcharge: parseFloat(newFare.surcharge),
        }),
      });

      if (response.ok) {
        fetchFares();
        setShowAddForm(false);
        setNewFare({
          class: 1,
          minDistance: '',
          maxDistance: '',
          surcharge: '',
          effectiveDate: new Date().toISOString().split('T')[0],
          expiryDate: '',
          isActive: true,
        });
      }
    } catch (error) {
      console.error('Failed to add AC fare:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this AC fare?')) return;

    try {
      const response = await fetch(`/api/pricing/ac-fares/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchFares();
      }
    } catch (error) {
      console.error('Failed to delete AC fare:', error);
    }
  };

  const formatDistance = (distance: string | null) => {
    if (!distance) return '∞';
    return `${parseFloat(distance)} km`;
  };

  const filteredFares =
    filterClass === 'all' ? fares : fares.filter((f) => f.class === filterClass);

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
            <h1 className="text-2xl font-bold text-gray-900">AC Fares</h1>
            <p className="text-gray-600 mt-1">Manage air conditioning surcharges</p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Add AC Fare
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-700">Filter by Class:</span>
          <div className="flex gap-2">
            {['all', 1, 2, 3].map((classNum) => (
              <button
                key={classNum}
                onClick={() => setFilterClass(classNum as number | 'all')}
                className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                  filterClass === classNum
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {classNum === 'all' ? 'All Classes' : `Class ${classNum}`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Add Fare Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Add AC Fare</h2>
          <form onSubmit={handleAddFare} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Class <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={newFare.class}
                onChange={(e) => setNewFare({ ...newFare, class: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value={1}>1st Class</option>
                <option value={2}>2nd Class</option>
                <option value={3}>3rd Class</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Min Distance (km) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={newFare.minDistance}
                onChange={(e) => setNewFare({ ...newFare, minDistance: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Distance (km)
              </label>
              <input
                type="number"
                step="0.01"
                value={newFare.maxDistance}
                onChange={(e) => setNewFare({ ...newFare, maxDistance: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="∞ (unlimited)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Surcharge (฿) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={newFare.surcharge}
                onChange={(e) => setNewFare({ ...newFare, surcharge: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="50.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Effective Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={newFare.effectiveDate}
                onChange={(e) => setNewFare({ ...newFare, effectiveDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
              <input
                type="date"
                value={newFare.expiryDate}
                onChange={(e) => setNewFare({ ...newFare, expiryDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-3">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={newFare.isActive}
                  onChange={(e) => setNewFare({ ...newFare, isActive: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Active</span>
              </label>
            </div>

            <div className="md:col-span-3 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add Fare
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Fares Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Class
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Distance Range
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Surcharge
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Effective Date
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
            {filteredFares.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                  <Snowflake className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                  <p>
                    {filterClass === 'all'
                      ? 'No AC fares configured'
                      : `No AC fares for Class ${filterClass}`}
                  </p>
                </td>
              </tr>
            ) : (
              filteredFares.map((fare) => (
                <tr key={fare.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded bg-blue-100 text-blue-800">
                      Class {fare.class}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-900">
                      {formatDistance(fare.minDistance)} - {formatDistance(fare.maxDistance)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-semibold text-gray-900">
                      ฿{parseFloat(fare.surcharge).toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-500">
                      {new Date(fare.effectiveDate).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded ${
                        fare.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {fare.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/pricing/ac-fares/${fare.id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(fare.id)}
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

      {/* Info */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> AC surcharges are applied to air-conditioned bogies based on class
          and distance. The surcharge is added on top of the base fare and distance fare.
        </p>
      </div>
    </div>
  );
}
