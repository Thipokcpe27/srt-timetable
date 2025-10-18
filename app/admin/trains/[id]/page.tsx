'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

interface TrainForm {
  trainNumber: string;
  nameTh?: string;
  nameEn?: string;
  nameCn?: string;
  trainTypeId: number;
  isActive: boolean;
}

interface TrainType {
  id: number;
  code: string;
  nameTh: string;
}

export default function TrainFormPage() {
  const router = useRouter();
  const params = useParams();
  const isEdit = params.id !== 'new';
  const trainId = isEdit ? parseInt(params.id as string) : null;

  const [form, setForm] = useState<TrainForm>({
    trainNumber: '',
    nameTh: '',
    nameEn: '',
    nameCn: '',
    trainTypeId: 0,
    isActive: true,
  });

  const [trainTypes, setTrainTypes] = useState<TrainType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchTrainTypes();
    if (isEdit && trainId) {
      fetchTrain();
    }
  }, [trainId]);

  const fetchTrainTypes = async () => {
    try {
      const response = await fetch('/api/train-types');
      const data = await response.json();
      if (data.success) {
        setTrainTypes(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch train types:', error);
    }
  };

  const fetchTrain = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/trains/${trainId}`);
      const data = await response.json();
      if (data.success) {
        setForm(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch train:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const url = isEdit ? `/api/trains/${trainId}` : '/api/trains';
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (response.ok) {
        router.push('/admin/trains');
      } else {
        alert('Failed to save train');
      }
    } catch (error) {
      console.error('Failed to save train:', error);
      alert('Failed to save train');
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
      <div className="mb-6">
        <Link
          href="/admin/trains"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Trains
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEdit ? 'Edit Train' : 'Add New Train'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Train Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={form.trainNumber}
                onChange={(e) => setForm({ ...form, trainNumber: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g., 001"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Train Type <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={form.trainTypeId}
                onChange={(e) => setForm({ ...form, trainTypeId: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select Type</option>
                {trainTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.code} - {type.nameTh}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Thai Name
              </label>
              <input
                type="text"
                value={form.nameTh || ''}
                onChange={(e) => setForm({ ...form, nameTh: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                English Name
              </label>
              <input
                type="text"
                value={form.nameEn || ''}
                onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chinese Name
              </label>
              <input
                type="text"
                value={form.nameCn || ''}
                onChange={(e) => setForm({ ...form, nameCn: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

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
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Link
            href="/admin/trains"
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
            {isSaving ? 'Saving...' : 'Save Train'}
          </button>
        </div>
      </form>
    </div>
  );
}
