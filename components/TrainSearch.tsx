'use client';

import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { searchSchema, type SearchFormData } from '@/lib/searchUtils';
import { SearchParams } from '@/lib/types';
import { Search, ArrowLeftRight, ChevronDown } from 'lucide-react';

interface StationData {
  id: string;
  name: string;
  code: number;
}

interface TrainSearchProps {
  onSearch: (params: SearchParams) => void;
  isLoading?: boolean;
  initialValues?: SearchParams;
}

export default function TrainSearch({ onSearch, isLoading = false, initialValues }: TrainSearchProps) {
  const [stations, setStations] = useState<StationData[]>([]);
  const [swapStations, setSwapStations] = useState(false);
  const [originSearch, setOriginSearch] = useState('');
  const [destinationSearch, setDestinationSearch] = useState('');
  const [showOriginDropdown, setShowOriginDropdown] = useState(false);
  const [showDestinationDropdown, setShowDestinationDropdown] = useState(false);
  const [focusedOriginIndex, setFocusedOriginIndex] = useState(-1);
  const [focusedDestinationIndex, setFocusedDestinationIndex] = useState(-1);
  const originRef = useRef<HTMLDivElement>(null);
  const destinationRef = useRef<HTMLDivElement>(null);

  // Fetch stations from API
  useEffect(() => {
    const fetchStations = async () => {
      try {
        const response = await fetch('/api/stations');
        const data = await response.json();
        if (data.success) {
          setStations(
            data.data
              .filter((s: { isActive: boolean }) => s.isActive)
              .map((s: { id: number; nameTh: string; stationCode: number }) => ({
                id: s.id.toString(),
                name: s.nameTh,
                code: s.stationCode,
              }))
          );
        }
      } catch (error) {
        console.error('Failed to fetch stations:', error);
      }
    };
    fetchStations();
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<SearchFormData>({
    resolver: zodResolver(searchSchema),
  });

  const origin = watch('origin');
  const destination = watch('destination');

  // Set initial values if provided
  useEffect(() => {
    if (initialValues && stations.length > 0) {
      setValue('origin', initialValues.origin);
      setValue('destination', initialValues.destination);
      const originStation = stations.find(s => s.id === initialValues.origin);
      const destStation = stations.find(s => s.id === initialValues.destination);
      if (originStation) setOriginSearch(originStation.name);
      if (destStation) setDestinationSearch(destStation.name);
    }
  }, [initialValues, setValue, stations]);

  // Filter stations based on search
  const filteredOriginStations = stations.filter(station =>
    station.name.toLowerCase().includes(originSearch.toLowerCase())
  );
  const filteredDestinationStations = stations.filter(station =>
    station.name.toLowerCase().includes(destinationSearch.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (originRef.current && !originRef.current.contains(event.target as Node)) {
        setShowOriginDropdown(false);
      }
      if (destinationRef.current && !destinationRef.current.contains(event.target as Node)) {
        setShowDestinationDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSwapStations = () => {
    const tempOrigin = origin;
    const tempOriginSearch = originSearch;
    setValue('origin', destination);
    setValue('destination', tempOrigin);
    setOriginSearch(destinationSearch);
    setDestinationSearch(tempOriginSearch);
    setSwapStations(!swapStations);
  };

  const handleOriginSelect = (stationId: string, stationName: string) => {
    setValue('origin', stationId);
    setOriginSearch(stationName);
    setShowOriginDropdown(false);
  };

  const handleDestinationSelect = (stationId: string, stationName: string) => {
    setValue('destination', stationId);
    setDestinationSearch(stationName);
    setShowDestinationDropdown(false);
  };

  // Keyboard navigation for origin dropdown
  const handleOriginKeyDown = (e: React.KeyboardEvent) => {
    if (!showOriginDropdown) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedOriginIndex(prev =>
          prev < filteredOriginStations.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedOriginIndex(prev => prev > 0 ? prev - 1 : prev);
        break;
      case 'Enter':
        e.preventDefault();
        if (focusedOriginIndex >= 0) {
          const station = filteredOriginStations[focusedOriginIndex];
          if (station) {
            handleOriginSelect(station.id, station.name);
            setFocusedOriginIndex(-1);
          }
        }
        break;
      case 'Escape':
        e.preventDefault();
        setShowOriginDropdown(false);
        setFocusedOriginIndex(-1);
        break;
    }
  };

  // Keyboard navigation for destination dropdown
  const handleDestinationKeyDown = (e: React.KeyboardEvent) => {
    if (!showDestinationDropdown) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedDestinationIndex(prev =>
          prev < filteredDestinationStations.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedDestinationIndex(prev => prev > 0 ? prev - 1 : prev);
        break;
      case 'Enter':
        e.preventDefault();
        if (focusedDestinationIndex >= 0) {
          const station = filteredDestinationStations[focusedDestinationIndex];
          if (station) {
            handleDestinationSelect(station.id, station.name);
            setFocusedDestinationIndex(-1);
          }
        }
        break;
      case 'Escape':
        e.preventDefault();
        setShowDestinationDropdown(false);
        setFocusedDestinationIndex(-1);
        break;
    }
  };

  const onSubmit = (data: SearchFormData) => {
    onSearch({
      origin: data.origin,
      destination: data.destination,
    });
  };

  return (
    <div className="backdrop-blur-md bg-white/70 rounded-lg shadow-lg border border-white/20 p-6 relative overflow-visible min-h-[200px]">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" role="search" aria-label="ค้นหารถไฟ">
        {/* Origin and Destination */}
        <div className="grid md:grid-cols-[1fr_auto_1fr] gap-4 items-start">
          {/* Origin */}
          <div ref={originRef} className="relative">
            <label htmlFor="origin-search" className="block text-sm font-medium text-gray-700 mb-2">
              สถานีต้นทาง
            </label>
            <span id="origin-help" className="sr-only">
              พิมพ์เพื่อค้นหาสถานี หรือใช้ลูกศรขึ้นลงเพื่อเลือกจากรายการ กด Enter เพื่อยืนยัน
            </span>
            <div className="relative">
              <input
                id="origin-search"
                type="text"
                value={originSearch}
                onChange={(e) => {
                  setOriginSearch(e.target.value);
                  setShowOriginDropdown(true);
                  setFocusedOriginIndex(-1);
                }}
                onFocus={() => setShowOriginDropdown(true)}
                onKeyDown={handleOriginKeyDown}
                placeholder="ค้นหาหรือเลือกสถานี"
                aria-label="ค้นหาสถานีต้นทาง"
                aria-expanded={showOriginDropdown}
                aria-controls="origin-dropdown"
                aria-autocomplete="list"
                aria-invalid={errors.origin ? 'true' : 'false'}
                aria-describedby={errors.origin ? 'origin-error' : 'origin-help'}
                aria-activedescendant={focusedOriginIndex >= 0 ? `origin-option-${focusedOriginIndex}` : undefined}
                className={`w-full px-4 py-2.5 pr-10 border backdrop-blur-sm bg-white/60 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  errors.origin ? 'border-red-500' : 'border-gray-200'
                }`}
              />
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" aria-hidden="true" />
              <input type="hidden" {...register('origin')} />
            </div>
            {showOriginDropdown && (
              <div
                id="origin-dropdown"
                role="listbox"
                aria-label="รายการสถานีต้นทาง"
                className="absolute z-[100] w-full mt-1 max-h-60 overflow-auto backdrop-blur-md bg-white/95 border border-gray-200 rounded-lg shadow-lg animate-slide-down"
              >
                {filteredOriginStations.length > 0 ? (
                  filteredOriginStations.map((station, index) => (
                    <button
                      key={station.id}
                      id={`origin-option-${index}`}
                      type="button"
                      role="option"
                      aria-selected={origin === station.id}
                      onClick={() => handleOriginSelect(station.id, station.name)}
                      className={`w-full px-4 py-2.5 text-left hover:bg-blue-50 transition-all duration-200 ${
                        index === focusedOriginIndex ? 'bg-blue-200 text-blue-900 font-semibold' :
                        origin === station.id ? 'bg-blue-100 text-blue-700 font-semibold' : 'text-gray-700'
                      }`}
                    >
                      {station.name}
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-2.5 text-gray-700 text-sm" role="status">ไม่พบสถานี</div>
                )}
              </div>
            )}
            {errors.origin && (
              <p id="origin-error" className="mt-1 text-sm text-red-700" role="alert">{errors.origin.message}</p>
            )}
          </div>

          {/* Swap Button */}
          <div className="flex items-end pb-3 md:pb-0 md:pt-8">
            <button
              type="button"
              onClick={handleSwapStations}
              aria-label="สลับสถานีต้นทางและปลายทาง"
              className="p-2.5 rounded-lg backdrop-blur-sm bg-gray-100/80 hover:bg-gray-200/80 text-gray-600 transition-all border border-white/40"
              title="สลับสถานี"
            >
              <ArrowLeftRight className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>

          {/* Destination */}
          <div ref={destinationRef} className="relative">
            <label htmlFor="destination-search" className="block text-sm font-medium text-gray-700 mb-2">
              สถานีปลายทาง
            </label>
            <span id="destination-help" className="sr-only">
              พิมพ์เพื่อค้นหาสถานี หรือใช้ลูกศรขึ้นลงเพื่อเลือกจากรายการ กด Enter เพื่อยืนยัน
            </span>
            <div className="relative">
              <input
                id="destination-search"
                type="text"
                value={destinationSearch}
                onChange={(e) => {
                  setDestinationSearch(e.target.value);
                  setShowDestinationDropdown(true);
                  setFocusedDestinationIndex(-1);
                }}
                onFocus={() => setShowDestinationDropdown(true)}
                onKeyDown={handleDestinationKeyDown}
                placeholder="ค้นหาหรือเลือกสถานี"
                aria-label="ค้นหาสถานีปลายทาง"
                aria-expanded={showDestinationDropdown}
                aria-controls="destination-dropdown"
                aria-autocomplete="list"
                aria-invalid={errors.destination ? 'true' : 'false'}
                aria-describedby={errors.destination ? 'destination-error' : 'destination-help'}
                aria-activedescendant={focusedDestinationIndex >= 0 ? `destination-option-${focusedDestinationIndex}` : undefined}
                className={`w-full px-4 py-2.5 pr-10 border backdrop-blur-sm bg-white/60 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  errors.destination ? 'border-red-500' : 'border-gray-200'
                }`}
              />
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" aria-hidden="true" />
              <input type="hidden" {...register('destination')} />
            </div>
            {showDestinationDropdown && (
              <div
                id="destination-dropdown"
                role="listbox"
                aria-label="รายการสถานีปลายทาง"
                className="absolute z-[100] w-full mt-1 max-h-60 overflow-auto backdrop-blur-md bg-white/95 border border-gray-200 rounded-lg shadow-lg animate-slide-down"
              >
                {filteredDestinationStations.length > 0 ? (
                  filteredDestinationStations.map((station, index) => (
                    <button
                      key={station.id}
                      id={`destination-option-${index}`}
                      type="button"
                      role="option"
                      aria-selected={destination === station.id}
                      onClick={() => handleDestinationSelect(station.id, station.name)}
                      className={`w-full px-4 py-2.5 text-left hover:bg-blue-50 transition-all duration-200 ${
                        index === focusedDestinationIndex ? 'bg-blue-200 text-blue-900 font-semibold' :
                        destination === station.id ? 'bg-blue-100 text-blue-700 font-semibold' : 'text-gray-700'
                      }`}
                    >
                      {station.name}
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-2.5 text-gray-700 text-sm" role="status">ไม่พบสถานี</div>
                )}
              </div>
            )}
            {errors.destination && (
              <p id="destination-error" className="mt-1 text-sm text-red-700" role="alert">{errors.destination.message}</p>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-center">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full md:w-auto md:px-8 bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            aria-label="ค้นหารถไฟ"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>กำลังค้นหา...</span>
              </>
            ) : (
              <>
                <Search className="w-5 h-5" aria-hidden="true" />
                <span>ค้นหารถไฟ</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
