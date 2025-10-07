'use client';

import { Train } from '@/lib/types';
import { X, Check, Minus } from 'lucide-react';

interface TrainComparisonProps {
  trains: Train[];
  onRemoveTrain: (trainId: string) => void;
  onClose: () => void;
}

export default function TrainComparison({ trains, onRemoveTrain, onClose }: TrainComparisonProps) {
  if (trains.length === 0) return null;

  const formatPrice = (price: number) => {
    return `฿${price.toLocaleString()}`;
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-2 md:p-4 animate-fade-in" role="dialog" aria-labelledby="comparison-title" aria-modal="true" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-auto animate-scale-in" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 md:p-6 flex items-center justify-between z-10">
          <div>
            <h2 id="comparison-title" className="text-lg md:text-2xl font-bold mb-1">เปรียบเทียบรถไฟ</h2>
            <p className="text-blue-100 text-xs md:text-sm">เปรียบเทียบ {trains.length} ขบวน</p>
          </div>
          <button
            onClick={onClose}
            aria-label="ปิดหน้าต่างเปรียบเทียบ"
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 md:w-6 md:h-6" aria-hidden="true" />
          </button>
        </div>

        {/* Mobile: Card View */}
        <div className="md:hidden p-4 space-y-4">
          {trains.map((train) => {
            const prices = train.classes.map(c => c.price);
            const minPrice = Math.min(...prices);
            const maxPrice = Math.max(...prices);
            
            return (
              <div key={train.id} className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
                {/* Train Header */}
                <div className="flex items-start justify-between pb-3 border-b border-gray-200">
                  <div>
                    <h3 className="font-bold text-gray-900">{train.trainName}</h3>
                    <p className="text-sm text-gray-600">{train.trainNumber}</p>
                  </div>
                  <button
                    onClick={() => onRemoveTrain(train.id)}
                    aria-label={`นำ ${train.trainName} ออกจากการเปรียบเทียบ`}
                    className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="w-4 h-4 text-gray-600" aria-hidden="true" />
                  </button>
                </div>

                {/* Details */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">เวลาออกเดินทาง</span>
                    <span className="font-semibold text-gray-900">{train.departureTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">เวลาถึง</span>
                    <span className="font-semibold text-gray-900">{train.arrivalTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">ระยะเวลา</span>
                    <span className="font-semibold text-gray-900">{train.duration}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">ราคา</span>
                    <span className="font-bold text-blue-700">
                      {formatPrice(minPrice)}
                      {minPrice !== maxPrice && ` - ${formatPrice(maxPrice)}`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">สถานีจอด</span>
                    <span className="font-semibold text-gray-900">{train.stops.length} สถานี</span>
                  </div>
                </div>

                {/* Classes */}
                <div className="pt-3 border-t border-gray-200">
                  <h4 className="text-xs font-semibold text-gray-700 mb-2">ชั้นที่นั่ง</h4>
                  <div className="space-y-2">
                    {train.classes.map((trainClass) => (
                      <div key={trainClass.id} className="flex justify-between items-center text-xs">
                        <span className="text-gray-700">{trainClass.name}</span>
                        <div className="text-right">
                          <div className="font-bold text-blue-600">{formatPrice(trainClass.price)}</div>
                          <div className="text-gray-500 text-xs">
                            เหลือ {trainClass.available}/{trainClass.totalSeats}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Amenities */}
                <div className="pt-3 border-t border-gray-200">
                  <h4 className="text-xs font-semibold text-gray-700 mb-2">สิ่งอำนวยความสะดวก</h4>
                  <div className="grid grid-cols-2 gap-1">
                    {train.amenities.map((amenity) => (
                      <div key={amenity.id} className="flex items-center gap-1 text-xs">
                        {amenity.available ? (
                          <Check className="w-3 h-3 text-green-600 flex-shrink-0" aria-hidden="true" />
                        ) : (
                          <Minus className="w-3 h-3 text-gray-400 flex-shrink-0" aria-hidden="true" />
                        )}
                        <span className={amenity.available ? 'text-gray-900' : 'text-gray-400'}>
                          {amenity.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Desktop: Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="p-4 text-left text-sm font-bold text-gray-700 sticky left-0 bg-gray-50 min-w-[180px]">
                  รายละเอียด
                </th>
                {trains.map((train) => (
                  <th key={train.id} className="p-4 text-center min-w-[250px] relative">
                    <div className="flex flex-col items-center gap-2">
                      <button
                        onClick={() => onRemoveTrain(train.id)}
                        aria-label={`นำ ${train.trainName} ออกจากการเปรียบเทียบ`}
                        className="absolute top-2 right-2 p-1 hover:bg-gray-200 rounded-full transition-colors"
                      >
                        <X className="w-4 h-4 text-gray-600" aria-hidden="true" />
                      </button>
                      <div className="text-lg font-bold text-gray-900">{train.trainName}</div>
                      <div className="text-sm text-gray-600">{train.trainNumber}</div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Departure Time */}
              <tr className="border-b border-gray-200">
                <td className="p-4 font-semibold text-gray-700 sticky left-0 bg-white">เวลาออกเดินทาง</td>
                {trains.map((train) => (
                  <td key={train.id} className="p-4 text-center text-gray-900">{train.departureTime}</td>
                ))}
              </tr>

              {/* Arrival Time */}
              <tr className="border-b border-gray-200 bg-gray-50/50">
                <td className="p-4 font-semibold text-gray-700 sticky left-0 bg-gray-50/50">เวลาถึง</td>
                {trains.map((train) => (
                  <td key={train.id} className="p-4 text-center text-gray-900">{train.arrivalTime}</td>
                ))}
              </tr>

              {/* Duration */}
              <tr className="border-b border-gray-200">
                <td className="p-4 font-semibold text-gray-700 sticky left-0 bg-white">ระยะเวลาเดินทาง</td>
                {trains.map((train) => (
                  <td key={train.id} className="p-4 text-center text-gray-900">{train.duration}</td>
                ))}
              </tr>

              {/* Price Range */}
              <tr className="border-b border-gray-200 bg-gray-50/50">
                <td className="p-4 font-semibold text-gray-700 sticky left-0 bg-gray-50/50">ราคา</td>
                {trains.map((train) => {
                  const prices = train.classes.map(c => c.price);
                  const minPrice = Math.min(...prices);
                  const maxPrice = Math.max(...prices);
                  return (
                    <td key={train.id} className="p-4 text-center">
                      <div className="text-blue-700 font-bold">
                        {formatPrice(minPrice)}
                        {minPrice !== maxPrice && ` - ${formatPrice(maxPrice)}`}
                      </div>
                    </td>
                  );
                })}
              </tr>

              {/* Classes */}
              <tr className="border-b border-gray-200">
                <td className="p-4 font-semibold text-gray-700 sticky left-0 bg-white">ชั้นที่นั่ง</td>
                {trains.map((train) => (
                  <td key={train.id} className="p-4">
                    <div className="space-y-2">
                      {train.classes.map((trainClass) => (
                        <div key={trainClass.id} className="text-sm">
                          <div className="font-semibold text-gray-900">{trainClass.name}</div>
                          <div className="text-blue-600 font-bold">{formatPrice(trainClass.price)}</div>
                          <div className="text-gray-600 text-xs">
                            เหลือ {trainClass.available}/{trainClass.totalSeats} ที่นั่ง
                          </div>
                        </div>
                      ))}
                    </div>
                  </td>
                ))}
              </tr>

              {/* Amenities */}
              <tr className="border-b border-gray-200 bg-gray-50/50">
                <td className="p-4 font-semibold text-gray-700 sticky left-0 bg-gray-50/50">สิ่งอำนวยความสะดวก</td>
                {trains.map((train) => (
                  <td key={train.id} className="p-4">
                    <div className="space-y-1">
                      {train.amenities.map((amenity) => (
                        <div key={amenity.id} className="flex items-center gap-2 text-sm">
                          {amenity.available ? (
                            <Check className="w-4 h-4 text-green-600 flex-shrink-0" aria-hidden="true" />
                          ) : (
                            <Minus className="w-4 h-4 text-gray-400 flex-shrink-0" aria-hidden="true" />
                          )}
                          <span className={amenity.available ? 'text-gray-900' : 'text-gray-400'}>
                            {amenity.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </td>
                ))}
              </tr>

              {/* Stops */}
              <tr className="border-b border-gray-200">
                <td className="p-4 font-semibold text-gray-700 sticky left-0 bg-white">จำนวนสถานีจอด</td>
                {trains.map((train) => (
                  <td key={train.id} className="p-4 text-center text-gray-900">
                    {train.stops.length} สถานี
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-4">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition-colors"
            >
              ปิด
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
