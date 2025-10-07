'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, MapPin, Clock, Users } from 'lucide-react';

interface PopularRoute {
  id: string;
  from: string;
  to: string;
  fromFull: string;
  toFull: string;
  searches: number;
  trend: 'up' | 'down' | 'stable';
  averagePrice: string;
  duration: string;
}

// Mock data - in production, this would come from an API
const mockPopularRoutes: PopularRoute[] = [
  {
    id: '1',
    from: 'BKK',
    to: 'CNX',
    fromFull: 'กรุงเทพ',
    toFull: 'เชียงใหม่',
    searches: 1847,
    trend: 'up',
    averagePrice: '฿650-1,850',
    duration: '11ชม. 45นาที',
  },
  {
    id: '2',
    from: 'BKK',
    to: 'HYI',
    fromFull: 'กรุงเทพ',
    toFull: 'หาดใหญ่',
    searches: 1523,
    trend: 'up',
    averagePrice: '฿750-2,150',
    duration: '14ชม. 45นาที',
  },
  {
    id: '3',
    from: 'BKK',
    to: 'UBN',
    fromFull: 'กรุงเทพ',
    toFull: 'อุบลราชธานี',
    searches: 892,
    trend: 'stable',
    averagePrice: '฿450-1,200',
    duration: '9ชม. 30นาที',
  },
  {
    id: '4',
    from: 'BKK',
    to: 'KKN',
    fromFull: 'กรุงเทพ',
    toFull: 'ขอนแก่น',
    searches: 756,
    trend: 'down',
    averagePrice: '฿400-1,100',
    duration: '7ชม. 15นาที',
  },
];

interface PopularRoutesProps {
  onRouteClick?: (from: string, to: string) => void;
}

export default function PopularRoutes({ onRouteClick }: PopularRoutesProps) {
  const [routes, setRoutes] = useState<PopularRoute[]>(mockPopularRoutes);
  const [isLive, setIsLive] = useState(true);

  // Simulate real-time updates
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      setRoutes(prev => 
        prev.map(route => ({
          ...route,
          searches: route.searches + Math.floor(Math.random() * 5),
        }))
      );
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [isLive]);

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

  return (
    <section 
      className="backdrop-blur-md bg-white/80 rounded-2xl border border-gray-100/50 p-6 shadow-card"
      aria-labelledby="popular-routes-heading"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-md">
            <TrendingUp className="w-5 h-5 text-white" aria-hidden="true" />
          </div>
          <div>
            <h2 id="popular-routes-heading" className="text-xl font-bold text-gray-900">
              เส้นทางยอดนิยม
            </h2>
            <p className="text-sm text-gray-600">อัพเดทแบบเรียลไทม์</p>
          </div>
        </div>
        
        {/* Live Indicator */}
        <div className="flex items-center gap-2" role="status" aria-live="polite">
          <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} aria-hidden="true"></div>
          <span className="text-xs font-semibold text-gray-700">
            {isLive ? 'LIVE' : 'PAUSED'}
          </span>
        </div>
      </div>

      {/* Routes List */}
      <div className="space-y-3" role="list">
        {routes.map((route, index) => (
          <button
            key={route.id}
            onClick={() => onRouteClick?.(route.from, route.to)}
            className="w-full backdrop-blur-sm bg-gradient-to-r from-gray-50/60 to-blue-50/40 hover:from-gray-100/70 hover:to-blue-100/50 rounded-xl p-4 border border-gray-100/50 hover:border-blue-200/60 transition-all duration-200 hover:shadow-md group"
            aria-label={`เส้นทาง ${route.fromFull} ไป ${route.toFull} ค้นหา ${route.searches} ครั้ง`}
          >
            <div className="flex items-start gap-4">
              {/* Rank */}
              <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-sm">
                <span className="text-sm font-bold text-white">{index + 1}</span>
              </div>

              {/* Route Info */}
              <div className="flex-1 min-w-0">
                {/* Route */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-bold text-gray-900 truncate">{route.fromFull}</span>
                  <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0" aria-hidden="true" />
                  <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                  <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0" aria-hidden="true" />
                  <span className="font-bold text-gray-900 truncate">{route.toFull}</span>
                </div>

                {/* Details */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-600">
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3" aria-hidden="true" />
                    <span className="font-semibold">
                      {route.searches.toLocaleString()} <span className="font-normal">ครั้ง</span>
                    </span>
                    <span className={`ml-1 ${getTrendColor(route.trend)}`} aria-label={`แนวโน้ม ${route.trend === 'up' ? 'เพิ่มขึ้น' : route.trend === 'down' ? 'ลดลง' : 'คงที่'}`}>
                      {getTrendIcon(route.trend)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" aria-hidden="true" />
                    <span>{route.duration}</span>
                  </div>
                  <div className="font-semibold text-blue-700">
                    {route.averagePrice}
                  </div>
                </div>
              </div>

              {/* Arrow Indicator */}
              <div className="flex-shrink-0 text-gray-400 group-hover:text-blue-600 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Footer Note */}
      <p className="mt-4 text-xs text-gray-500 text-center">
        💡 ข้อมูลอัพเดททุก 5 วินาที • คลิกเพื่อค้นหาเส้นทาง
      </p>
    </section>
  );
}
