'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Calculator, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface Station {
  id: number;
  stationCode: number;
  nameTh: string;
  nameEn: string;
}

interface Train {
  id: number;
  trainNumber: string;
  trainNameTh: string;
  trainNameEn: string;
}

interface PriceBreakdown {
  baseFare: number;
  distanceFare: number;
  acSurcharge: number;
  berthFare: number;
  totalFare: number;
  distance: number;
  breakdown: Array<{
    component: string;
    amount: number;
    description: string;
  }>;
}

export default function PricingCalculatorPage() {
  const [stations, setStations] = useState<Station[]>([]);
  const [trains, setTrains] = useState<Train[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [result, setResult] = useState<PriceBreakdown | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [params, setParams] = useState({
    trainId: '',
    fromStationId: '',
    toStationId: '',
    class: 2,
    hasAC: false,
    hasSleeper: false,
    berthType: '',
  });

  useEffect(() => {
    fetchStations();
    fetchTrains();
  }, []);

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

  const fetchTrains = async () => {
    try {
      const response = await fetch('/api/trains');
      const data = await response.json();
      if (data.success) {
        setTrains(data.data.filter((t: Train & { isActive: boolean }) => t.isActive));
      }
    } catch (error) {
      console.error('Failed to fetch trains:', error);
    }
  };

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCalculating(true);
    setError(null);
    setResult(null);

    try {
      const requestBody: Record<string, unknown> = {
        trainId: parseInt(params.trainId),
        fromStationId: parseInt(params.fromStationId),
        toStationId: parseInt(params.toStationId),
        class: params.class,
      };

      if (params.hasSleeper && params.berthType) {
        requestBody.berthType = params.berthType;
      }

      const response = await fetch('/api/pricing/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (data.success) {
        setResult(data.data);
      } else {
        setError(data.error?.message || 'Calculation failed');
      }
    } catch (error) {
      setError('Failed to calculate price. Please try again.');
      console.error('Calculation error:', error);
    } finally {
      setIsCalculating(false);
    }
  };

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
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pricing Calculator</h1>
          <p className="text-gray-600 mt-1">Test and verify pricing calculations</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-2 mb-6">
            <Calculator className="h-6 w-6 text-indigo-600" />
            <h2 className="text-lg font-semibold text-gray-900">Calculate Price</h2>
          </div>

          <form onSubmit={handleCalculate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Train <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={params.trainId}
                onChange={(e) => setParams({ ...params, trainId: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select Train</option>
                {trains.map((train) => (
                  <option key={train.id} value={train.id}>
                    {train.trainNumber} - {train.trainNameTh}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                From Station <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={params.fromStationId}
                onChange={(e) => setParams({ ...params, fromStationId: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select Origin</option>
                {stations.map((station) => (
                  <option key={station.id} value={station.id}>
                    {station.nameTh} ({station.nameEn})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-center py-2">
              <ArrowRight className="h-5 w-5 text-gray-400" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                To Station <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={params.toStationId}
                onChange={(e) => setParams({ ...params, toStationId: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select Destination</option>
                {stations.map((station) => (
                  <option key={station.id} value={station.id}>
                    {station.nameTh} ({station.nameEn})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Class <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={params.class}
                onChange={(e) => setParams({ ...params, class: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value={1}>1st Class</option>
                <option value={2}>2nd Class</option>
                <option value={3}>3rd Class</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={params.hasAC}
                  onChange={(e) => setParams({ ...params, hasAC: e.target.checked })}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-700">Air Conditioning</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={params.hasSleeper}
                  onChange={(e) =>
                    setParams({
                      ...params,
                      hasSleeper: e.target.checked,
                      berthType: e.target.checked ? 'lower' : '',
                    })
                  }
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-700">Sleeper Berth</span>
              </label>
            </div>

            {params.hasSleeper && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Berth Type</label>
                <select
                  value={params.berthType}
                  onChange={(e) => setParams({ ...params, berthType: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="lower">Lower Berth</option>
                  <option value="upper">Upper Berth</option>
                  <option value="cabin">Private Cabin</option>
                </select>
              </div>
            )}

            <button
              type="submit"
              disabled={isCalculating}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              <Calculator className="h-5 w-5" />
              {isCalculating ? 'Calculating...' : 'Calculate Price'}
            </button>
          </form>
        </div>

        {/* Result Display */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Calculation Result</h2>

          {!result && !error && (
            <div className="text-center py-12">
              <Calculator className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">Fill in the form and click Calculate</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {result && (
            <div className="space-y-6">
              {/* Total Fare */}
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-6 text-white">
                <p className="text-sm text-indigo-100 mb-1">Total Fare</p>
                <p className="text-4xl font-bold">฿{result.totalFare.toLocaleString()}</p>
                <p className="text-sm text-indigo-100 mt-2">
                  Distance: {result.distance.toFixed(2)} km
                </p>
              </div>

              {/* Breakdown */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Price Breakdown</h3>
                <div className="space-y-2">
                  {result.breakdown.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">{item.component}</p>
                        <p className="text-xs text-gray-500">{item.description}</p>
                      </div>
                      <span className="text-sm font-semibold text-gray-900">
                        ฿{item.amount.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Base Fare</span>
                  <span className="font-medium">฿{result.baseFare.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Distance Fare</span>
                  <span className="font-medium">฿{result.distanceFare.toLocaleString()}</span>
                </div>
                {result.acSurcharge > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">AC Surcharge</span>
                    <span className="font-medium">฿{result.acSurcharge.toLocaleString()}</span>
                  </div>
                )}
                {result.berthFare > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Berth Fare</span>
                    <span className="font-medium">฿{result.berthFare.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-semibold pt-2 border-t">
                  <span className="text-gray-900">Total</span>
                  <span className="text-indigo-600">฿{result.totalFare.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
