'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

export default function AmenityFormPage() {
  const router = useRouter();
  const params = useParams();
  const isEdit = params.id !== 'new';
  const id = isEdit ? parseInt(params.id as string) : null;

  const [form, setForm] = useState({
    code: '',
    nameTh: '',
    nameEn: '',
    nameCn: '',
    icon: '✨',
    isActive: true,
  });

  const [isSaving, setIsSaving] = useState(false);

  const commonIcons = ['✨', '🍽️', '☕', '📶', '🔌', '❄️', '🚽', '♿', '📺', '🛏️', '🚿', '🔒'];

  useEffect(() => {
    if (isEdit && id) {
      fetch(`/api/amenities/${id}`)
        .then((res) => res.json())
        .then((data) => data.success && setForm(data.data));
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const url = isEdit ? `/api/amenities/${id}` : '/api/amenities';
    const response = await fetch(url, {
      method: isEdit ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    if (response.ok) {
      router.push('/admin/amenities');
    }
    setIsSaving(false);
  };

  return (
    <div>
      <Link
        href="/admin/amenities"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Amenities
      </Link>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        {isEdit ? 'Edit' : 'Add'} Amenity
      </h1>

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
                placeholder="wifi, power_outlet, restaurant"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Icon <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  value={form.icon}
                  onChange={(e) => setForm({ ...form, icon: e.target.value })}
                  className="w-20 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-2xl text-center"
                />
                <div className="flex-1 flex flex-wrap gap-2">
                  {commonIcons.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setForm({ ...form, icon })}
                      className={`text-2xl px-3 py-2 border rounded-lg hover:bg-gray-50 ${
                        form.icon === icon ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name (Thai) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={form.nameTh}
                onChange={(e) => setForm({ ...form, nameTh: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name (English) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={form.nameEn}
                onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name (Chinese)
              </label>
              <input
                type="text"
                value={form.nameCn}
                onChange={(e) => setForm({ ...form, nameCn: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 mt-8">
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
            href="/admin/amenities"
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
