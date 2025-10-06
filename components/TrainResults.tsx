'use client';

import { useState } from 'react';
import { Train, SearchParams } from '@/lib/types';
import { getStationName } from '@/lib/trainData';
import TrainCard from './TrainCard';
import TrainFilter, { FilterOptions } from './TrainFilter';
import EmptyState from './EmptyState';
import { ArrowUpDown } from 'lucide-react';

interface TrainResultsProps {
  trains: Train[];
  searchParams: SearchParams;
  selectedTrains?: Train[];
  onToggleCompare?: (train: Train) => void;
}

type SortOption = 'departure' | 'price-low' | 'price-high' | 'duration';

export default function TrainResults({ trains, searchParams, selectedTrains = [], onToggleCompare }: TrainResultsProps) {
  const [filteredTrains, setFilteredTrains] = useState<Train[]>(trains);
  const [sortBy, setSortBy] = useState<SortOption>('departure');

  const sortTrains = (trainsToSort: Train[], sortOption: SortOption): Train[] => {
    const sorted = [...trainsToSort];
    switch (sortOption) {
      case 'departure':
        return sorted.sort((a, b) => a.departureTime.localeCompare(b.departureTime));
      case 'price-low':
        return sorted.sort((a, b) => {
          const minPriceA = Math.min(...a.classes.map(c => c.price));
          const minPriceB = Math.min(...b.classes.map(c => c.price));
          return minPriceA - minPriceB;
        });
      case 'price-high':
        return sorted.sort((a, b) => {
          const minPriceA = Math.min(...a.classes.map(c => c.price));
          const minPriceB = Math.min(...b.classes.map(c => c.price));
          return minPriceB - minPriceA;
        });
      case 'duration':
        return sorted.sort((a, b) => {
          const durationA = parseInt(a.duration.split(':')[0]) * 60 + parseInt(a.duration.split(':')[1]);
          const durationB = parseInt(b.duration.split(':')[0]) * 60 + parseInt(b.duration.split(':')[1]);
          return durationA - durationB;
        });
      default:
        return sorted;
    }
  };

  const handleFilterChange = (filters: FilterOptions) => {
    let filtered = [...trains];

    // Filter by train type
    if (filters.trainTypes.length > 0) {
      filtered = filtered.filter(train =>
        filters.trainTypes.some(type => train.trainName.includes(type))
      );
    }

    // Filter by price range
    filtered = filtered.filter(train => {
      const minPrice = Math.min(...train.classes.map(c => c.price));
      return minPrice >= filters.priceRange.min && minPrice <= filters.priceRange.max;
    });

    // Filter by departure time
    if (filters.departureTimeRange.length > 0) {
      filtered = filtered.filter(train => {
        const [hours] = train.departureTime.split(':').map(Number);
        return filters.departureTimeRange.some(range => {
          if (range === 'morning') return hours >= 6 && hours < 12;
          if (range === 'afternoon') return hours >= 12 && hours < 18;
          if (range === 'evening') return hours >= 18 && hours < 24;
          if (range === 'night') return hours >= 0 && hours < 6;
          return false;
        });
      });
    }

    const sorted = sortTrains(filtered, sortBy);
    setFilteredTrains(sorted);
  };

  const handleSortChange = (newSort: SortOption) => {
    setSortBy(newSort);
    const sorted = sortTrains(filteredTrains, newSort);
    setFilteredTrains(sorted);
  };

  if (trains.length === 0) {
    return (
      <EmptyState
        type="no-results"
        title="ไม่พบรถไฟที่ตรงกับการค้นหา"
        description={`ไม่มีรถไฟเดินทางจาก ${getStationName(searchParams.origin)} ไป ${getStationName(searchParams.destination)} ลองเปลี่ยนสถานีหรือวันที่เดินทางใหม่`}
      />
    );
  }

  return (
    <div className="space-y-5">
      {/* Search Summary */}
      <div className="backdrop-blur-md bg-white/80 rounded-lg border border-gray-100/80 p-5 shadow-card min-h-[100px]">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-1">ผลการค้นหา</h2>
            <p className="text-sm text-gray-600">
              {getStationName(searchParams.origin)} → {getStationName(searchParams.destination)}
            </p>
          </div>
          <div className="text-sm text-gray-600">
            พบ <span className="font-semibold text-gray-900">{filteredTrains.length}</span> จาก {trains.length} ขบวน
          </div>
        </div>
      </div>

      {/* Filter and Sort */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <TrainFilter onFilterChange={handleFilterChange} />
        </div>
        
        {/* Sort Options */}
        <div className="backdrop-blur-md bg-white/80 rounded-lg border border-white/40 p-4 md:p-5 min-h-[80px]">
          <div className="flex items-center gap-2 mb-3">
            <ArrowUpDown className="w-5 h-5 text-gray-700" />
            <label htmlFor="sort-select" className="text-gray-700 font-semibold">
              เรียงตาม
            </label>
          </div>
          <select
            id="sort-select"
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value as SortOption)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/60"
            aria-label="เรียงลำดับผลการค้นหา"
          >
            <option value="departure">เวลาออกเดินทาง</option>
            <option value="price-low">ราคา: ต่ำไปสูง</option>
            <option value="price-high">ราคา: สูงไปต่ำ</option>
            <option value="duration">ระยะเวลาการเดินทาง</option>
          </select>
        </div>
      </div>

      {/* Train Cards */}
      {filteredTrains.length === 0 ? (
        <EmptyState
          type="no-results"
          title="ไม่พบรถไฟที่ตรงกับตัวกรอง"
          description="ลองปรับเปลี่ยนตัวกรองหรือช่วงราคาเพื่อดูรถไฟเพิ่มเติม"
        />
      ) : (
        <div className="space-y-4">
          {filteredTrains.map((train, idx) => (
            <div
              key={train.id}
              className="animate-fade-in"
              style={{
                animationDelay: `${idx * 0.05}s`,
                contentVisibility: 'auto',
                containIntrinsicSize: '1px 200px'
              }}
            >
              <TrainCard
                train={train}
                isSelected={selectedTrains.some(t => t.id === train.id)}
                onToggleCompare={onToggleCompare}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
