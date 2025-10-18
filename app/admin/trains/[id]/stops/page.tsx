'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Plus, GripVertical, Trash2, Clock, MapPin } from 'lucide-react';
import Link from 'next/link';

interface TrainStop {
  id: number;
  stationId: number;
  stopOrder: number;
  arrivalTime?: string;
  departureTime?: string;
  platformNumber?: string;
  distanceFromOrigin?: number;
  station: {
    stationCode: string;
    nameTh: string;
    nameEn: string;
  };
}

interface Station {
  id: number;
  stationCode: string;
  nameTh: string;
  nameEn: string;
}

export default function TrainStopsPage() {
  const params = useParams();
  const router = useRouter();
  const trainId = parseInt(params.id as string);

  const [stops, setStops] = useState<TrainStop[]>([]);
  const [stations, setStations] = useState<Station[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const [newStop, setNewStop] = useState({
    stationId: 0,
    arrivalTime: '',
    departureTime: '',
    platformNumber: '',
    distanceFromOrigin: 0,
  });

  useEffect(() => {
    fetchStops();
    fetchStations();
  }, [trainId]);

  const fetchStops = async () => {
    try {
      const response = await fetch(`/api/trains/${trainId}/stops`);
      const data = await response.json();
      if (data.success) {
        setStops(data.data.sort((a: TrainStop, b: TrainStop) => a.stopOrder - b.stopOrder));
      }
    } catch (error) {
      console.error('Failed to fetch stops:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStations = async () => {
    try {
      const response = await fetch('/api/stations');
      const data = await response.json();
      if (data.success) {
        setStations(data.data.filter((s: Station & { isActive: boolean }) => s.isActive));
      }
    } catch (error) {
      console.error('Failed to fetch stations:', error);
    }
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newStops = [...stops];
    const draggedStop = newStops[draggedIndex];
    if (!draggedStop) return;

    newStops.splice(draggedIndex, 1);
    newStops.splice(index, 0, draggedStop);

    setStops(newStops);
    setDraggedIndex(index);
  };

  const handleDragEnd = async () => {
    if (draggedIndex === null) return;

    // Update stop orders
    const updatedStops = stops.map((stop, index) => ({
      ...stop,
      stopOrder: index + 1,
    }));

    setStops(updatedStops);
    setDraggedIndex(null);

    // Save new order to backend
    try {
      await fetch(`/api/trains/${trainId}/stops/reorder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stops: updatedStops.map((s) => ({ id: s.id, stopOrder: s.stopOrder })),
        }),
      });
    } catch (error) {
      console.error('Failed to reorder stops:', error);
    }
  };

  const handleAddStop = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch(`/api/trains/${trainId}/stops`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newStop,
          stopOrder: stops.length + 1,
        }),
      });

      if (response.ok) {
        fetchStops();
        setShowAddForm(false);
        setNewStop({
          stationId: 0,
          arrivalTime: '',
          departureTime: '',
          platformNumber: '',
          distanceFromOrigin: 0,
        });
      }
    } catch (error) {
      console.error('Failed to add stop:', error);
    }
  };

  const handleDeleteStop = async (stopId: number) => {
    if (!confirm('Are you sure you want to delete this stop?')) return;

    try {
      const response = await fetch(`/api/trains/${trainId}/stops/${stopId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchStops();
      }
    } catch (error) {
      console.error('Failed to delete stop:', error);
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
      <div className="mb-6">
        <Link
          href="/admin/trains"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Trains
        </Link>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Manage Train Stops</h1>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" />
            Add Stop
          </button>
        </div>
      </div>

      {/* Add Stop Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Add New Stop</h2>
          <form onSubmit={handleAddStop} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Station <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={newStop.stationId}
                onChange={(e) => setNewStop({ ...newStop, stationId: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select Station</option>
                {stations.map((station) => (
                  <option key={station.id} value={station.id}>
                    {station.stationCode} - {station.nameTh}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Arrival Time
              </label>
              <input
                type="time"
                value={newStop.arrivalTime}
                onChange={(e) => setNewStop({ ...newStop, arrivalTime: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Departure Time
              </label>
              <input
                type="time"
                value={newStop.departureTime}
                onChange={(e) => setNewStop({ ...newStop, departureTime: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Platform</label>
              <input
                type="text"
                value={newStop.platformNumber}
                onChange={(e) => setNewStop({ ...newStop, platformNumber: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Distance (km)
              </label>
              <input
                type="number"
                step="0.01"
                value={newStop.distanceFromOrigin}
                onChange={(e) =>
                  setNewStop({ ...newStop, distanceFromOrigin: parseFloat(e.target.value) })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
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
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Add Stop
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Stops List */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            Drag and drop stops to reorder them. The order represents the train route.
          </p>
        </div>

        {stops.length === 0 ? (
          <div className="text-center py-12">
            <MapPin className="h-12 w-12 mx-auto text-gray-300 mb-2" />
            <p className="text-gray-500">No stops added yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {stops.map((stop, index) => (
              <div
                key={stop.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={`flex items-center gap-4 p-4 border border-gray-200 rounded-lg cursor-move hover:bg-gray-50 transition-colors ${
                  draggedIndex === index ? 'opacity-50' : ''
                }`}
              >
                <GripVertical className="h-5 w-5 text-gray-400" />

                <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Order</p>
                    <p className="font-semibold text-gray-900">{stop.stopOrder}</p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Station</p>
                    <p className="font-medium text-gray-900">{stop.station.stationCode}</p>
                    <p className="text-xs text-gray-500">{stop.station.nameTh}</p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Arrival</p>
                    <p className="text-sm text-gray-900 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {stop.arrivalTime || '-'}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Departure</p>
                    <p className="text-sm text-gray-900 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {stop.departureTime || '-'}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Distance</p>
                    <p className="text-sm text-gray-900">
                      {stop.distanceFromOrigin ? `${stop.distanceFromOrigin} km` : '-'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteStop(stop.id)}
                  className="text-red-600 hover:text-red-900"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
