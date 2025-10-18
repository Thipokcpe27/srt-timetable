'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

export default function BogieFormPage() {
  const router = useRouter();
  const params = useParams();
  const isEdit = params.id !== 'new';
  const bogieId = isEdit ? parseInt(params.id as string) : null;

  const [form, setForm] = useState({
    code: '',
    nameTh: '',
    nameEn: '',
    nameCn: '',
    class: 1,
    seatCount: 0,
    hasAC: false,
    hasSleeper: false,
    isActive: true,
  });

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isEdit && bogieId) {
      fetch(`/api/bogies/${bogieId}`)
        .then((res) => res.json())
        .then((data) => data.success && setForm(data.data));
    }
  }, [bogieId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const url = isEdit ? `/api/bogies/${bogieId}` : '/api/bogies';
    const response = await fetch(url, {
      method: isEdit ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    if (response.ok) {
      router.push('/admin/bogies');
    }
    setIsSaving(false);
  };

  return (
    <div>
      <Link href="/admin/bogies" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4">
        <ArrowLeft className="h-4 w-4" />
        Back to Bogies
      </Link>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{isEdit ? 'Edit' : 'Add'} Bogie</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Class <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={form.class}
                onChange={(e) => setForm({ ...form, class: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value={1}>1st Class</option>
                <option value={2}>2nd Class</option>
                <option value={3}>3rd Class</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Thai Name</label>
              <input
                type="text"
                value={form.nameTh}
                onChange={(e) => setForm({ ...form, nameTh: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">English Name</label>
              <input
                type="text"
                value={form.nameEn}
                onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Seat Count</label>
              <input
                type="number"
                value={form.seatCount}
                onChange={(e) => setForm({ ...form, seatCount: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.hasAC}
                  onChange={(e) => setForm({ ...form, hasAC: e.target.checked })}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-700">Has AC</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.hasSleeper}
                  onChange={(e) => setForm({ ...form, hasSleeper: e.target.checked })}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-700">Has Sleeper</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-700">Active</span>
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Link
            href="/admin/bogies"
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            <Save className="h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
}
