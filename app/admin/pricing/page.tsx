'use client';

import Link from 'next/link';
import { DollarSign, Train, MapPin, Snowflake, Bed } from 'lucide-react';

export default function PricingManagementPage() {
  const pricingModules = [
    {
      title: 'Train Fares',
      description: 'Manage base fares for different train types and distance ranges',
      icon: Train,
      href: '/admin/pricing/train-fares',
      color: 'indigo',
      isReady: true,
    },
    {
      title: 'Distance Fares',
      description: 'Configure distance-based fare calculation ranges',
      icon: MapPin,
      href: '/admin/pricing/distance-fares',
      color: 'green',
      isReady: true,
    },
    {
      title: 'AC Fares',
      description: 'Set air conditioning surcharges by class and distance',
      icon: Snowflake,
      href: '/admin/pricing/ac-fares',
      color: 'blue',
      isReady: true,
    },
    {
      title: 'Berth Fares',
      description: 'Manage sleeper berth pricing for overnight trains',
      icon: Bed,
      href: '/admin/pricing/berth-fares',
      color: 'purple',
      isReady: true,
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Pricing Management</h1>
        <p className="text-gray-600 mt-1">
          Manage all pricing components for train tickets
        </p>
      </div>

      {/* Pricing Calculator Card */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg shadow-lg p-8 text-white mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Price Calculator</h2>
            <p className="text-indigo-100 mb-4">
              Test pricing calculations for any route and train combination
            </p>
            <Link
              href="/admin/pricing/calculator"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-indigo-600 rounded-lg hover:bg-gray-100 transition-colors font-medium"
            >
              <DollarSign className="h-5 w-5" />
              Open Price Calculator
            </Link>
          </div>
          <DollarSign className="h-24 w-24 text-indigo-300 opacity-50" />
        </div>
      </div>

      {/* Pricing Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {pricingModules.map((module) => {
          const Icon = module.icon;
          const colorClasses = {
            indigo: 'bg-indigo-100 text-indigo-600 hover:bg-indigo-50',
            green: 'bg-green-100 text-green-600 hover:bg-green-50',
            blue: 'bg-blue-100 text-blue-600 hover:bg-blue-50',
            purple: 'bg-purple-100 text-purple-600 hover:bg-purple-50',
          };

          return (
            <Link
              key={module.title}
              href={module.href}
              className={`bg-white rounded-lg shadow-sm p-6 border-2 border-transparent hover:border-${module.color}-500 transition-all ${
                !module.isReady ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`rounded-lg p-3 ${colorClasses[module.color as keyof typeof colorClasses]}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1 flex items-center gap-2">
                    {module.title}
                    {!module.isReady && (
                      <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                        Coming Soon
                      </span>
                    )}
                  </h3>
                  <p className="text-sm text-gray-600">{module.description}</p>
                  {module.isReady && (
                    <p className="text-sm text-indigo-600 mt-2 font-medium">Manage →</p>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Info Section */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">
          📋 About Pricing System
        </h3>
        <div className="text-sm text-blue-800 space-y-2">
          <p>
            <strong>Total Fare Calculation:</strong> Base Fare (Train Type) + Distance Fare + AC
            Surcharge (if applicable) + Berth Fee (if sleeper)
          </p>
          <p>
            <strong>API Endpoints:</strong> All pricing data is managed via REST APIs. Use the
            links above to access API documentation and manage pricing data.
          </p>
          <p>
            <strong>Pricing Engine:</strong> The pricing engine at{' '}
            <code className="bg-blue-100 px-2 py-1 rounded">/api/pricing/calculate</code>{' '}
            automatically calculates the total fare based on your configured pricing rules.
          </p>
        </div>
      </div>
    </div>
  );
}
