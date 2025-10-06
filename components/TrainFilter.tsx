'use client';

import { useState } from 'react';
import { Filter, X } from 'lucide-react';

export interface FilterOptions {
  trainTypes: string[];
  priceRange: { min: number; max: number };
  departureTimeRange: string[];
}

interface TrainFilterProps {
  onFilterChange: (filters: FilterOptions) => void;
}

export default function TrainFilter({ onFilterChange }: TrainFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [priceMin, setPriceMin] = useState<number>(0);
  const [priceMax, setPriceMax] = useState<number>(5000);
  const [selectedTimes, setSelectedTimes] = useState<string[]>([]);

  const trainTypes = [
    { value: 'ด่วนพิเศษ', label: 'ด่วนพิเศษ', color: 'bg-purple-100 text-purple-700' },
    { value: 'ด่วน', label: 'ด่วน', color: 'bg-blue-100 text-blue-700' },
    { value: 'ธรรมดา', label: 'ธรรมดา', color: 'bg-gray-100 text-gray-700' },
  ];

  const timeRanges = [
    { value: 'morning', label: 'เช้า (06:00-12:00)' },
    { value: 'afternoon', label: 'บ่าย (12:00-18:00)' },
    { value: 'evening', label: 'เย็น (18:00-24:00)' },
    { value: 'night', label: 'กลางคืน (00:00-06:00)' },
  ];

  const handleTypeToggle = (type: string) => {
    const newTypes = selectedTypes.includes(type)
      ? selectedTypes.filter(t => t !== type)
      : [...selectedTypes, type];
    setSelectedTypes(newTypes);
    applyFilters(newTypes, { min: priceMin, max: priceMax }, selectedTimes);
  };

  const handleTimeToggle = (time: string) => {
    const newTimes = selectedTimes.includes(time)
      ? selectedTimes.filter(t => t !== time)
      : [...selectedTimes, time];
    setSelectedTimes(newTimes);
    applyFilters(selectedTypes, { min: priceMin, max: priceMax }, newTimes);
  };

  const handlePriceChange = (min: number, max: number) => {
    setPriceMin(min);
    setPriceMax(max);
    applyFilters(selectedTypes, { min, max }, selectedTimes);
  };

  const applyFilters = (types: string[], price: { min: number; max: number }, times: string[]) => {
    onFilterChange({
      trainTypes: types,
      priceRange: price,
      departureTimeRange: times,
    });
  };

  const clearFilters = () => {
    setSelectedTypes([]);
    setPriceMin(0);
    setPriceMax(5000);
    setSelectedTimes([]);
    onFilterChange({
      trainTypes: [],
      priceRange: { min: 0, max: 5000 },
      departureTimeRange: [],
    });
  };

  const hasActiveFilters = selectedTypes.length > 0 || selectedTimes.length > 0 || priceMin > 0 || priceMax < 5000;

  return (
    <section
      className="backdrop-blur-md bg-white/80 rounded-lg border border-white/40 p-4 md:p-5 min-h-[80px]"
      aria-labelledby="filter-heading"
    >
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-controls="filter-content"
          aria-label={isOpen ? 'ซ่อนตัวกรอง' : 'แสดงตัวกรอง'}
          className="flex items-center gap-2 text-gray-700 font-semibold hover:text-blue-600 transition-colors"
        >
          <Filter className="w-5 h-5" aria-hidden="true" />
          <span id="filter-heading">ตัวกรอง</span>
          {hasActiveFilters && (
            <span
              className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full"
              aria-label={`ตัวกรองที่ใช้งาน ${selectedTypes.length + selectedTimes.length + (priceMin > 0 || priceMax < 5000 ? 1 : 0)} รายการ`}
            >
              {selectedTypes.length + selectedTimes.length + (priceMin > 0 || priceMax < 5000 ? 1 : 0)}
            </span>
          )}
        </button>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            aria-label="ล้างตัวกรองทั้งหมด"
            className="text-sm text-gray-700 hover:text-red-600 transition-colors flex items-center gap-1"
          >
            <X className="w-4 h-4" aria-hidden="true" />
            <span>ล้างตัวกรอง</span>
          </button>
        )}
      </div>

      {isOpen && (
        <div id="filter-content" className="space-y-6 pt-4 border-t border-gray-200/50">
          {/* Train Type Filter */}
          <fieldset>
            <legend className="text-sm font-bold text-gray-900 mb-3">ประเภทรถไฟ</legend>
            <div className="flex flex-wrap gap-2" role="group" aria-label="เลือกประเภทรถไฟ">
              {trainTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => handleTypeToggle(type.value)}
                  role="checkbox"
                  aria-checked={selectedTypes.includes(type.value)}
                  aria-label={`ประเภทรถไฟ ${type.label}`}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all border-2 ${
                    selectedTypes.includes(type.value)
                      ? 'border-blue-500 ' + type.color
                      : 'border-gray-200 bg-white/60 text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </fieldset>

          {/* Price Range Filter */}
          <fieldset>
            <legend className="text-sm font-bold text-gray-900 mb-3">ช่วงราคา</legend>
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label htmlFor="price-min" className="text-xs text-gray-700 mb-1 block">ต่ำสุด</label>
                  <input
                    id="price-min"
                    type="number"
                    value={priceMin}
                    onChange={(e) => handlePriceChange(Number(e.target.value), priceMax)}
                    aria-label="ราคาต่ำสุด"
                    aria-valuemin={0}
                    aria-valuemax={priceMax}
                    aria-valuenow={priceMin}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="0"
                    max={priceMax}
                  />
                </div>
                <span className="text-gray-700 mt-5" aria-hidden="true">-</span>
                <div className="flex-1">
                  <label htmlFor="price-max" className="text-xs text-gray-700 mb-1 block">สูงสุด</label>
                  <input
                    id="price-max"
                    type="number"
                    value={priceMax}
                    onChange={(e) => handlePriceChange(priceMin, Number(e.target.value))}
                    aria-label="ราคาสูงสุด"
                    aria-valuemin={priceMin}
                    aria-valuemax={5000}
                    aria-valuenow={priceMax}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min={priceMin}
                    max="5000"
                  />
                </div>
              </div>
              <div className="text-xs text-gray-700" role="status" aria-live="polite">
                ฿{priceMin.toLocaleString()} - ฿{priceMax.toLocaleString()}
              </div>
            </div>
          </fieldset>

          {/* Departure Time Filter */}
          <fieldset>
            <legend className="text-sm font-bold text-gray-900 mb-3">เวลาออกเดินทาง</legend>
            <div className="grid grid-cols-2 gap-2" role="group" aria-label="เลือกเวลาออกเดินทาง">
              {timeRanges.map((time) => (
                <button
                  key={time.value}
                  onClick={() => handleTimeToggle(time.value)}
                  role="checkbox"
                  aria-checked={selectedTimes.includes(time.value)}
                  aria-label={`เวลาออกเดินทาง ${time.label}`}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all border-2 ${
                    selectedTimes.includes(time.value)
                      ? 'border-blue-500 bg-blue-100 text-blue-700'
                      : 'border-gray-200 bg-white/60 text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {time.label}
                </button>
              ))}
            </div>
          </fieldset>
        </div>
      )}
    </section>
  );
}
