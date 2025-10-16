'use client';

import { useState, useEffect } from 'react';

export default function TestAPIPage() {
  const [stations, setStations] = useState<any[]>([]);
  const [searchResult, setSearchResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ทดสอบ API /api/stations
  const testStations = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/stations');
      const data = await response.json();
      if (data.success) {
        setStations(data.data);
      } else {
        setError(data.error);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ทดสอบ API /api/trains/search
  const testSearch = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/trains/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ origin: 'BKK', destination: 'CNX' }),
      });
      const data = await response.json();
      if (data.success) {
        setSearchResult(data);
      } else {
        setError(data.error || data.message);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    testStations();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🧪 API Testing Page</h1>

        {/* Error Display */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Test Stations API */}
        <section className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">
            1. GET /api/stations
            <span className="text-sm font-normal text-gray-500 ml-2">
              ({stations.length} สถานี)
            </span>
          </h2>
          
          {loading && <p>Loading...</p>}
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {stations.slice(0, 6).map((station: any) => (
              <div key={station.id} className="border rounded p-3">
                <div className="font-bold text-lg">{station.code}</div>
                <div className="text-gray-700">{station.name}</div>
                <div className="text-sm text-gray-500">
                  {station.city} • {station.region}
                </div>
              </div>
            ))}
          </div>

          <details className="text-sm">
            <summary className="cursor-pointer text-blue-600">
              Show Raw JSON
            </summary>
            <pre className="bg-gray-100 p-4 rounded mt-2 overflow-auto max-h-96">
              {JSON.stringify(stations, null, 2)}
            </pre>
          </details>
        </section>

        {/* Test Search API */}
        <section className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">
            2. POST /api/trains/search
          </h2>
          
          <button
            onClick={testSearch}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-bold disabled:opacity-50 mb-4"
          >
            {loading ? 'Searching...' : 'ค้นหา BKK → CNX'}
          </button>

          {searchResult && (
            <div>
              <div className="mb-4">
                <strong>ผลการค้นหา:</strong> {searchResult.count} ขบวน
              </div>

              <div className="space-y-4">
                {searchResult.data?.map((train: any) => (
                  <div key={train.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-lg">{train.trainName}</h3>
                        <p className="text-gray-600">
                          ขบวน {train.trainNumber}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{train.departureTime} → {train.arrivalTime}</div>
                        <div className="text-sm text-gray-500">{train.duration}</div>
                      </div>
                    </div>

                    {/* Classes */}
                    <div className="mt-3 flex gap-2">
                      {train.classes?.map((cls: any) => (
                        <div key={cls.id} className="bg-gray-100 px-3 py-1 rounded text-sm">
                          {cls.name}: <strong>฿{cls.price.toLocaleString()}</strong>
                        </div>
                      ))}
                    </div>

                    {/* Amenities */}
                    <div className="mt-2 flex gap-2 flex-wrap">
                      {train.amenities?.map((amenity: any) => (
                        <span key={amenity.id} className="text-xs bg-blue-100 px-2 py-1 rounded">
                          {amenity.icon} {amenity.name}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <details className="text-sm mt-4">
                <summary className="cursor-pointer text-blue-600">
                  Show Raw JSON
                </summary>
                <pre className="bg-gray-100 p-4 rounded mt-2 overflow-auto max-h-96">
                  {JSON.stringify(searchResult, null, 2)}
                </pre>
              </details>
            </div>
          )}
        </section>

        {/* Quick Links */}
        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-4">Quick API Links</h2>
          <div className="space-y-2">
            <a href="/api/stations" target="_blank" className="block text-blue-600 hover:underline">
              → /api/stations
            </a>
            <a href="/api/test-thai" target="_blank" className="block text-blue-600 hover:underline">
              → /api/test-thai
            </a>
            <a href="/api/popular-trains" target="_blank" className="block text-blue-600 hover:underline">
              → /api/popular-trains
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
