'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Trash2, Bed } from 'lucide-react';
import Link from 'next/link';

interface Bogie {
  id: number;
  code: string;
  nameTh: string;
  nameEn: string;
  class: number;
  hasSleeper: boolean;
  isActive: boolean;
}

interface BerthFare {
  id: number;
  bogieId: number;
  berthType: string;
  fare: string;
  bogie: Bogie;
}

export default function BerthFaresPage() {
  const [fares, setFares] = useState<BerthFare[]>([]);
  const [bogies, setBogies] = useState<Bogie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  const [newFare, setNewFare] = useState({
    bogieId: 0,
    berthType: 'lower',
    fare: '',
  });

  useEffect(() => {
    fetchFares();
    fetchBogies();
  }, []);

  const fetchFares = async () => {
    try {
      const allBogies = await fetch('/api/bogies').then((r) => r.json());
      if (allBogies.success) {
        const sleeperBogies = allBogies.data.filter((b: Bogie) => b.hasSleeper);

        const faresPromises = sleeperBogies.map((bogie: Bogie) =>
          fetch(`/api/bogies/${bogie.id}/berth-fares`).then((r) => r.json())
        );

        const faresResults = await Promise.all(faresPromises);
        const allFares = faresResults.flatMap((result) => (result.success ? result.data : []));
        setFares(allFares);
      }
    } catch (error) {
      console.error('Failed to fetch berth fares:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBogies = async () => {
    try {
      const response = await fetch('/api/bogies');
      const data = await response.json();
      if (data.success) {
        setBogies(data.data.filter((b: Bogie) => b.hasSleeper && b.isActive));
      }
    } catch (error) {
      console.error('Failed to fetch bogies:', error);
    }
  };

  const handleAddFare = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch(`/api/bogies/${newFare.bogieId}/berth-fares`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          berthType: newFare.berthType,
          fare: parseFloat(newFare.fare),
        }),
      });

      if (response.ok) {
        fetchFares();
        setShowAddForm(false);
        setNewFare({
          bogieId: 0,
          berthType: 'lower',
          fare: '',
        });
      }
    } catch (error) {
      console.error('Failed to add berth fare:', error);
    }
  };

  const handleDelete = async (bogieId: number, fareId: number) => {
    if (!confirm('Delete this berth fare?')) return;

    try {
      const response = await fetch(`/api/bogies/${bogieId}/berth-fares/${fareId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchFares();
      }
    } catch (error) {
      console.error('Failed to delete berth fare:', error);
    }
  };

  const getBerthTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      upper: 'Upper Berth',
      lower: 'Lower Berth',
      cabin: 'Private Cabin',
    };
    return labels[type] || type;
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
            <h1 className="text-2xl font-bold text-gray-900">Berth Fares</h1>
            <p className="text-gray-600 mt-1">Manage sleeper berth pricing</p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <Plus className="h-4 w-4" />
            Add Berth Fare
          </button>
        </div>
      </div>

      {/* Add Fare Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Add Berth Fare</h2>
          <form onSubmit={handleAddFare} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sleeper Bogie <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={newFare.bogieId}
                onChange={(e) => setNewFare({ ...newFare, bogieId: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Select Sleeper Bogie</option>
                {bogies.map((bogie) => (
                  <option key={bogie.id} value={bogie.id}>
                    {bogie.code} - {bogie.nameTh} (Class {bogie.class})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Berth Type <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={newFare.berthType}
                onChange={(e) => setNewFare({ ...newFare, berthType: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="lower">Lower Berth</option>
                <option value="upper">Upper Berth</option>
                <option value="cabin">Private Cabin</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fare (฿) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={newFare.fare}
                onChange={(e) => setNewFare({ ...newFare, fare: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="100.00"
              />
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
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
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
                Bogie
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Class
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Berth Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Fare
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {fares.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  <Bed className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                  <p>No berth fares configured</p>
                </td>
              </tr>
            ) : (
              fares.map((fare) => (
                <tr key={fare.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{fare.bogie.nameTh}</p>
                      <p className="text-xs text-gray-500">{fare.bogie.code}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded bg-purple-100 text-purple-800">
                      Class {fare.bogie.class}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-900">{getBerthTypeLabel(fare.berthType)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-semibold text-gray-900">
                      ฿{parseFloat(fare.fare).toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDelete(fare.bogieId, fare.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
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
          <strong>Note:</strong> Berth fares are applied to sleeper bogies. Different berth types
          (upper, lower, cabin) can have different prices for the same bogie.
        </p>
      </div>
    </div>
  );
}
