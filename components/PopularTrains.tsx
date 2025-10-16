'use client';

import { useState, useEffect, useRef } from 'react';
import { TrendingUp, Train, Clock, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import { getPopularTrains } from '@/lib/api';

interface PopularTrain {
  id: string;
  trainNumber: string;
  trainName: string;
  route: string;
  routeFull: string;
  searches: number;
  trend: 'up' | 'down' | 'stable';
  duration: string;
  priceRange: string;
  image?: string;
}

// Mock data - sorted by searches (most popular first)
const mockPopularTrains: PopularTrain[] = [
  {
    id: 'T001',
    trainNumber: 'SP001',
    trainName: 'ด่วนพิเศษกรุงเทพ-เชียงใหม่',
    route: 'BKK → CNX',
    routeFull: 'กรุงเทพ - เชียงใหม่',
    searches: 2847,
    trend: 'up',
    duration: '11ชม. 45นาที',
    priceRange: '฿650-1,850',
  },
  {
    id: 'T002',
    trainNumber: 'SP002',
    trainName: 'ด่วนพิเศษกรุงเทพ-หาดใหญ่',
    route: 'BKK → HYI',
    routeFull: 'กรุงเทพ - หาดใหญ่',
    searches: 2123,
    trend: 'up',
    duration: '14ชม. 45นาที',
    priceRange: '฿750-2,150',
  },
  {
    id: 'T003',
    trainNumber: 'SP003',
    trainName: 'ด่วนพิเศษกรุงเทพ-อุบลราชธานี',
    route: 'BKK → UBN',
    routeFull: 'กรุงเทพ - อุบลราชธานี',
    searches: 1692,
    trend: 'stable',
    duration: '9ชม. 30นาที',
    priceRange: '฿450-1,200',
  },
  {
    id: 'T004',
    trainNumber: 'EXP001',
    trainName: 'ด่วนกรุงเทพ-ขอนแก่น',
    route: 'BKK → KKN',
    routeFull: 'กรุงเทพ - ขอนแก่น',
    searches: 1456,
    trend: 'up',
    duration: '7ชม. 15นาที',
    priceRange: '฿400-1,100',
  },
  {
    id: 'T005',
    trainNumber: 'SP004',
    trainName: 'ด่วนพิเศษกรุงเทพ-สุราษฎร์ธานี',
    route: 'BKK → SRT',
    routeFull: 'กรุงเทพ - สุราษฎร์ธานี',
    searches: 1234,
    trend: 'down',
    duration: '8ชม. 20นาที',
    priceRange: '฿500-1,350',
  },
];

interface PopularTrainsProps {
  onTrainClick?: (trainId: string, origin: string, destination: string) => void;
}

export default function PopularTrains({ onTrainClick }: PopularTrainsProps) {
  const [trains, setTrains] = useState<PopularTrain[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Load popular trains from API
  useEffect(() => {
    async function loadPopularTrains() {
      try {
        setLoading(true);
        const data = await getPopularTrains(10);
        
        // Transform API data to component format
        const transformedTrains: PopularTrain[] = data.map((train: any) => ({
          id: train.trainId,
          trainNumber: train.trainNumber,
          trainName: train.trainName,
          route: `${train.originCode} → ${train.destinationCode}`,
          routeFull: `${train.originName} - ${train.destinationName}`,
          searches: train.searchCount || 0,
          trend: 'stable' as const,
          duration: train.duration || '-',
          priceRange: train.minFare && train.maxFare 
            ? `฿${train.minFare.toLocaleString()}-${train.maxFare.toLocaleString()}`
            : '฿-',
        }));
        
        setTrains(transformedTrains.length > 0 ? transformedTrains : mockPopularTrains);
      } catch (error) {
        console.error('Failed to load popular trains:', error);
        setTrains(mockPopularTrains);
      } finally {
        setLoading(false);
      }
    }
    loadPopularTrains();
  }, []);

  // Simulate real-time search count updates (only if trains loaded)
  useEffect(() => {
    if (trains.length === 0) return;
    
    const interval = setInterval(() => {
      setTrains(prev => 
        prev.map(train => ({
          ...train,
          searches: train.searches + Math.floor(Math.random() * 3),
        })).sort((a, b) => b.searches - a.searches)
      );
    }, 8000);

    return () => clearInterval(interval);
  }, [trains.length]);

  // Auto-slide functionality
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      handleNext();
    }, 5000); // Auto-slide every 5 seconds

    return () => clearInterval(interval);
  }, [isAutoPlaying, currentIndex]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % trains.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + trains.length) % trains.length);
  };

  const handleDotClick = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
  };

  const handleTrainClick = (train: PopularTrain) => {
    const origin = train.route.split(' → ')[0];
    const destination = train.route.split(' → ')[1];
    onTrainClick?.(train.id, origin, destination);
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return '📈';
      case 'down':
        return '📉';
      default:
        return '➡️';
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  // Calculate visible cards based on screen size
  const getVisibleCards = () => {
    if (typeof window === 'undefined') return 1;
    if (window.innerWidth >= 1280) return 4; // Desktop: 4 cards
    if (window.innerWidth >= 1024) return 3; // Large tablet: 3 cards
    if (window.innerWidth >= 768) return 2;  // Tablet: 2 cards
    return 1; // Mobile: 1 card
  };

  if (loading) {
    return (
      <section className="backdrop-blur-md bg-white/80 rounded-2xl border border-gray-100/50 p-6 shadow-card">
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-orange-600 border-r-transparent"></div>
          <p className="mt-2 text-gray-600">กำลังโหลดรถไฟยอดนิยม...</p>
        </div>
      </section>
    );
  }

  if (trains.length === 0) {
    return null;
  }

  return (
    <section 
      className="backdrop-blur-md bg-white/80 rounded-2xl border border-gray-100/50 p-6 shadow-card"
      aria-labelledby="popular-trains-heading"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-md">
            <TrendingUp className="w-5 h-5 text-white" aria-hidden="true" />
          </div>
          <div>
            <h2 id="popular-trains-heading" className="text-xl font-bold text-gray-900">
              รถไฟยอดนิยม
            </h2>
            <p className="text-sm text-gray-600">เรียงตามความนิยม • อัพเดทเรียลไทม์</p>
          </div>
        </div>
        
        {/* Live Indicator */}
        <div className="flex items-center gap-2" role="status" aria-live="polite">
          <div className={`w-2 h-2 rounded-full ${isAutoPlaying ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} aria-hidden="true"></div>
          <span className="text-xs font-semibold text-gray-700">
            {isAutoPlaying ? 'LIVE' : 'PAUSED'}
          </span>
        </div>
      </div>

      {/* Carousel Container */}
      <div className="relative">
        {/* Navigation Buttons */}
        <button
          onClick={() => { handlePrev(); setIsAutoPlaying(false); }}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-10 h-10 bg-white rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 flex items-center justify-center text-gray-700 hover:text-blue-600"
          aria-label="รถไฟคันก่อนหน้า"
        >
          <ChevronLeft className="w-5 h-5" aria-hidden="true" />
        </button>

        <button
          onClick={() => { handleNext(); setIsAutoPlaying(false); }}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-10 h-10 bg-white rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 flex items-center justify-center text-gray-700 hover:text-blue-600"
          aria-label="รถไฟคันถัดไป"
        >
          <ChevronRight className="w-5 h-5" aria-hidden="true" />
        </button>

        {/* Cards Container */}
        <div className="overflow-hidden" ref={scrollContainerRef}>
          <div 
            className="flex transition-transform duration-500 ease-out gap-4"
          >
            {trains.map((train, index) => (
              <div
                key={train.id}
                className="flex-shrink-0"
              >
                <button
                  onClick={() => handleTrainClick(train)}
                  className="backdrop-blur-sm bg-gradient-to-br from-blue-50/60 to-indigo-50/40 hover:from-blue-100/70 hover:to-indigo-100/50 rounded-xl p-5 border border-blue-200/60 hover:border-blue-300/80 transition-all duration-300 hover:shadow-lg group relative overflow-hidden w-[280px]"
                  aria-label={`${train.trainName} ค้นหา ${train.searches} ครั้ง`}
                >
                  {/* Rank Badge */}
                  <div className="absolute top-3 right-3 w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center shadow-md">
                    <span className="text-xs font-bold text-white">#{index + 1}</span>
                  </div>

                  {/* Train Icon */}
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center mb-4 shadow-md group-hover:scale-110 transition-transform">
                    <Train className="w-6 h-6 text-white" aria-hidden="true" />
                  </div>

                  {/* Train Info */}
                  <div className="text-left mb-4">
                    <div className="text-xs font-semibold text-blue-600 mb-1">{train.trainNumber}</div>
                    <h3 className="text-base font-bold text-gray-900 mb-2 line-clamp-1">
                      {train.trainName}
                    </h3>
                    <div className="text-sm text-gray-700 font-medium mb-3">
                      {train.routeFull}
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-3 text-xs">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-gray-600" aria-hidden="true" />
                        <span className="text-gray-600">{train.duration}</span>
                      </div>
                      <div className="font-semibold text-blue-700">
                        {train.priceRange}
                      </div>
                    </div>
                  </div>

                  {/* Search Stats */}
                  <div className="flex items-center justify-between pt-3 border-t border-blue-200/50">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4 text-gray-600" aria-hidden="true" />
                      <span className="text-sm font-bold text-gray-900">
                        {train.searches.toLocaleString()}
                      </span>
                      <span className="text-xs text-gray-600">ครั้ง</span>
                    </div>
                    <div className={`text-lg ${getTrendColor(train.trend)}`} aria-label={`แนวโน้ม ${train.trend === 'up' ? 'เพิ่มขึ้น' : train.trend === 'down' ? 'ลดลง' : 'คงที่'}`}>
                      {getTrendIcon(train.trend)}
                    </div>
                  </div>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Dots Indicator */}
        <div className="flex items-center justify-center gap-2 mt-6">
          {trains.map((_, index) => (
            <button
              key={index}
              onClick={() => handleDotClick(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentIndex 
                  ? 'w-8 bg-blue-600' 
                  : 'w-2 bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`ไปยังรถไฟคันที่ ${index + 1}`}
              aria-current={index === currentIndex}
            />
          ))}
        </div>
      </div>

      {/* Footer Note */}
      <p className="mt-4 text-xs text-gray-500 text-center">
        💡 อัพเดททุก 8 วินาที • เรียงตามจำนวนการค้นหา • คลิกเพื่อค้นหา
      </p>
    </section>
  );
}
