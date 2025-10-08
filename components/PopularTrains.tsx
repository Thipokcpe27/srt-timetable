'use client';

import { useState, useEffect, useRef } from 'react';
import { TrendingUp, Train, Clock, Users, ChevronLeft, ChevronRight } from 'lucide-react';

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
  const [trains, setTrains] = useState<PopularTrain[]>(mockPopularTrains);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Simulate real-time search count updates
  useEffect(() => {
    const interval = setInterval(() => {
      setTrains(prev => 
        prev.map(train => ({
          ...train,
          searches: train.searches + Math.floor(Math.random() * 3),
        })).sort((a, b) => b.searches - a.searches) // Re-sort by searches
      );
    }, 8000); // Update every 8 seconds

    return () => clearInterval(interval);
  }, []);

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

  return (
    <section 
      className="backdrop-blur-md bg-white/80 rounded-xl border border-gray-100/50 p-3 shadow-card"
      aria-labelledby="popular-trains-heading"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h2 id="popular-trains-heading" className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
          <TrendingUp className="w-3.5 h-3.5 text-orange-500" aria-hidden="true" />
          รถไฟยอดนิยม
        </h2>
        
        {/* Live Indicator */}
        <div className={`w-1 h-1 rounded-full ${isAutoPlaying ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} aria-hidden="true"></div>
      </div>

      {/* Carousel Container */}
      <div className="relative">
        {/* Navigation Buttons */}
        <button
          onClick={() => { handlePrev(); setIsAutoPlaying(false); }}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 z-10 w-6 h-6 bg-white rounded-full shadow-md hover:shadow-lg transition-all flex items-center justify-center text-gray-700 hover:text-blue-600"
          aria-label="รถไฟคันก่อนหน้า"
        >
          <ChevronLeft className="w-3 h-3" aria-hidden="true" />
        </button>

        <button
          onClick={() => { handleNext(); setIsAutoPlaying(false); }}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 z-10 w-6 h-6 bg-white rounded-full shadow-md hover:shadow-lg transition-all flex items-center justify-center text-gray-700 hover:text-blue-600"
          aria-label="รถไฟคันถัดไป"
        >
          <ChevronRight className="w-3 h-3" aria-hidden="true" />
        </button>

        {/* Cards Container */}
        <div className="overflow-hidden" ref={scrollContainerRef}>
          <div 
            className="flex transition-transform duration-500 ease-out gap-4"
            style={{ transform: `translateX(-${currentIndex * (100 / getVisibleCards())}%)` }}
          >
            {trains.map((train, index) => (
              <div
                key={train.id}
                className="flex-shrink-0 w-full md:w-1/2 lg:w-1/3 xl:w-1/4"
                style={{ minWidth: `calc(${100 / getVisibleCards()}% - 1rem)` }}
              >
                <button
                  onClick={() => handleTrainClick(train)}
                  className="w-full backdrop-blur-sm bg-gradient-to-br from-blue-50/60 to-indigo-50/40 hover:from-blue-100/70 hover:to-indigo-100/50 rounded-md p-2 border border-blue-200/60 hover:border-blue-300/80 transition-all duration-300 hover:shadow-md group relative overflow-hidden"
                  aria-label={`${train.trainName} ค้นหา ${train.searches} ครั้ง`}
                >
                  {/* Rank Badge */}
                  <div className="absolute top-1 right-1 w-4 h-4 bg-gradient-to-br from-orange-500 to-red-500 rounded flex items-center justify-center">
                    <span className="text-[8px] font-bold text-white">#{index + 1}</span>
                  </div>

                  {/* Train Info */}
                  <div className="text-left">
                    <h3 className="text-[11px] font-bold text-gray-900 mb-0.5 line-clamp-2 pr-4">
                      {train.trainName}
                    </h3>
                    <div className="flex items-center justify-between text-[9px]">
                      <span className="text-gray-600">{train.routeFull}</span>
                      <span className="font-bold text-gray-900">{train.searches.toLocaleString()}</span>
                    </div>
                  </div>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Dots Indicator */}
        <div className="flex items-center justify-center gap-1 mt-2">
          {trains.map((_, index) => (
            <button
              key={index}
              onClick={() => handleDotClick(index)}
              className={`h-1 rounded-full transition-all ${
                index === currentIndex 
                  ? 'w-4 bg-blue-600' 
                  : 'w-1 bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`ไปยังรถไฟคันที่ ${index + 1}`}
              aria-current={index === currentIndex}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
