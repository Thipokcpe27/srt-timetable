'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Plus, GripVertical, Trash2, Package } from 'lucide-react';
import Link from 'next/link';

interface Bogie {
  id: number;
  code: string;
  nameTh: string;
  nameEn: string;
  class: number;
  seatCount: number;
  hasAC: boolean;
  hasSleeper: boolean;
}

interface TrainComposition {
  id: number;
  bogieId: number;
  sortOrder: number;
  quantity: number;
  bogie: Bogie;
}

export default function TrainCompositionsPage() {
  const params = useParams();
  const router = useRouter();
  const trainId = parseInt(params.id as string);

  const [compositions, setCompositions] = useState<TrainComposition[]>([]);
  const [availableBogies, setAvailableBogies] = useState<Bogie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const [newComposition, setNewComposition] = useState({
    bogieId: 0,
    quantity: 1,
  });

  useEffect(() => {
    fetchCompositions();
    fetchBogies();
  }, [trainId]);

  const fetchCompositions = async () => {
    try {
      const response = await fetch(`/api/trains/${trainId}/compositions`);
      const data = await response.json();
      if (data.success) {
        setCompositions(
          data.data.sort((a: TrainComposition, b: TrainComposition) => a.sortOrder - b.sortOrder)
        );
      }
    } catch (error) {
      console.error('Failed to fetch compositions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBogies = async () => {
    try {
      const response = await fetch('/api/bogies');
      const data = await response.json();
      if (data.success) {
        setAvailableBogies(data.data.filter((b: Bogie & { isActive: boolean }) => b.isActive));
      }
    } catch (error) {
      console.error('Failed to fetch bogies:', error);
    }
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newCompositions = [...compositions];
    const draggedItem = newCompositions[draggedIndex];
    if (!draggedItem) return;

    newCompositions.splice(draggedIndex, 1);
    newCompositions.splice(index, 0, draggedItem);

    setCompositions(newCompositions);
    setDraggedIndex(index);
  };

  const handleDragEnd = async () => {
    if (draggedIndex === null) return;

    const updatedCompositions = compositions.map((comp, index) => ({
      ...comp,
      sortOrder: index + 1,
    }));

    setCompositions(updatedCompositions);
    setDraggedIndex(null);

    try {
      await fetch(`/api/trains/${trainId}/compositions/reorder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          compositions: updatedCompositions.map((c) => ({ id: c.id, sortOrder: c.sortOrder })),
        }),
      });
    } catch (error) {
      console.error('Failed to reorder compositions:', error);
    }
  };

  const handleAddComposition = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch(`/api/trains/${trainId}/compositions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newComposition,
          sortOrder: compositions.length + 1,
        }),
      });

      if (response.ok) {
        fetchCompositions();
        setShowAddForm(false);
        setNewComposition({ bogieId: 0, quantity: 1 });
      }
    } catch (error) {
      console.error('Failed to add composition:', error);
    }
  };

  const handleDeleteComposition = async (compId: number) => {
    if (!confirm('Are you sure you want to remove this bogie from the train?')) return;

    try {
      const response = await fetch(`/api/trains/${trainId}/compositions/${compId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchCompositions();
      }
    } catch (error) {
      console.error('Failed to delete composition:', error);
    }
  };

  const totalSeats = compositions.reduce(
    (sum, comp) => sum + comp.bogie.seatCount * comp.quantity,
    0
  );
  const totalBogies = compositions.reduce((sum, comp) => sum + comp.quantity, 0);

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
          href="/admin/trains"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Trains
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Train Composition</h1>
            <p className="text-sm text-gray-600 mt-1">
              Total: {totalBogies} bogies, {totalSeats} seats
            </p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" />
            Add Bogie
          </button>
        </div>
      </div>

      {/* Add Composition Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Add Bogie to Train</h2>
          <form onSubmit={handleAddComposition} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bogie <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={newComposition.bogieId}
                onChange={(e) =>
                  setNewComposition({ ...newComposition, bogieId: parseInt(e.target.value) })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select Bogie</option>
                {availableBogies.map((bogie) => (
                  <option key={bogie.id} value={bogie.id}>
                    {bogie.code} - {bogie.nameTh} (Class {bogie.class}, {bogie.seatCount} seats)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                required
                value={newComposition.quantity}
                onChange={(e) =>
                  setNewComposition({ ...newComposition, quantity: parseInt(e.target.value) })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
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
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Add Bogie
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Compositions List */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            Drag and drop to reorder bogies. The order represents the train composition from front
            to back.
          </p>
        </div>

        {compositions.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-12 w-12 mx-auto text-gray-300 mb-2" />
            <p className="text-gray-500">No bogies added yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {compositions.map((comp, index) => (
              <div
                key={comp.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={`flex items-center gap-4 p-4 border border-gray-200 rounded-lg cursor-move hover:bg-gray-50 transition-colors ${
                  draggedIndex === index ? 'opacity-50' : ''
                }`}
              >
                <GripVertical className="h-5 w-5 text-gray-400" />

                <div className="flex-1 grid grid-cols-1 md:grid-cols-6 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Order</p>
                    <p className="font-semibold text-gray-900">{comp.sortOrder}</p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Code</p>
                    <p className="font-medium text-gray-900">{comp.bogie.code}</p>
                  </div>

                  <div className="md:col-span-2">
                    <p className="text-xs text-gray-500">Name</p>
                    <p className="font-medium text-gray-900">{comp.bogie.nameTh}</p>
                    <p className="text-xs text-gray-500">{comp.bogie.nameEn}</p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Class / Seats</p>
                    <p className="text-sm text-gray-900">
                      Class {comp.bogie.class} / {comp.bogie.seatCount} seats
                    </p>
                    <div className="flex gap-1 mt-1">
                      {comp.bogie.hasAC && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                          AC
                        </span>
                      )}
                      {comp.bogie.hasSleeper && (
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                          Sleeper
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Quantity</p>
                    <p className="font-semibold text-indigo-600 text-lg">×{comp.quantity}</p>
                    <p className="text-xs text-gray-500">
                      {comp.bogie.seatCount * comp.quantity} total seats
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteComposition(comp.id)}
                  className="text-red-600 hover:text-red-900"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Composition Summary */}
      {compositions.length > 0 && (
        <div className="mt-6 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
          <h3 className="text-lg font-semibold mb-4">Train Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-indigo-100 text-sm">Total Bogies</p>
              <p className="text-3xl font-bold">{totalBogies}</p>
            </div>
            <div>
              <p className="text-indigo-100 text-sm">Total Seats</p>
              <p className="text-3xl font-bold">{totalSeats}</p>
            </div>
            <div>
              <p className="text-indigo-100 text-sm">AC Bogies</p>
              <p className="text-3xl font-bold">
                {compositions.filter((c) => c.bogie.hasAC).reduce((sum, c) => sum + c.quantity, 0)}
              </p>
            </div>
            <div>
              <p className="text-indigo-100 text-sm">Sleeper Bogies</p>
              <p className="text-3xl font-bold">
                {compositions
                  .filter((c) => c.bogie.hasSleeper)
                  .reduce((sum, c) => sum + c.quantity, 0)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
