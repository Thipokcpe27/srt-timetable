'use client';

import { useState, useEffect } from 'react';
import { SearchHistoryItem, searchHistoryService } from '@/lib/searchHistory';
import { getStationName } from '@/lib/trainData';
import { Clock, X, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface SearchHistoryProps {
  onSelectHistory: (item: SearchHistoryItem) => void;
}

export default function SearchHistory({ onSelectHistory }: SearchHistoryProps) {
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    // Only load history on client side
    if (typeof window !== 'undefined') {
      setHistory(searchHistoryService.getHistory());
    }
  }, []);

  const handleRemove = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    searchHistoryService.removeFromHistory(id);
    setHistory(searchHistoryService.getHistory());
  };

  const handleClearAll = () => {
    searchHistoryService.clearHistory();
    setHistory([]);
  };

  if (history.length === 0) return null;

  const displayedHistory = isExpanded ? history : history.slice(0, 3);

  return (
    <div className="backdrop-blur-md bg-white/80 rounded-xl border border-gray-100/80 p-4 shadow-card">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">ประวัติการค้นหา</h3>
        </div>
        <button
          onClick={handleClearAll}
          className="text-sm text-gray-500 hover:text-red-600 transition-colors flex items-center gap-1"
          aria-label="ลบประวัติทั้งหมด"
        >
          <Trash2 className="w-4 h-4" />
          <span>ลบทั้งหมด</span>
        </button>
      </div>

      <div className="space-y-2">
        {displayedHistory.map(item => (
          <div
            key={item.id}
            className="relative p-3 rounded-lg hover:bg-blue-50/50 transition-colors border border-gray-100/50 hover:border-blue-200 group"
          >
            <button
              onClick={() => onSelectHistory(item)}
              className="w-full text-left"
              aria-label={`ค้นหาจาก ${getStationName(item.origin)} ไป ${getStationName(item.destination)} อีกครั้ง`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-900 mb-1">
                    <span className="truncate">{getStationName(item.origin)}</span>
                    <span className="text-gray-400">→</span>
                    <span className="truncate">{getStationName(item.destination)}</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
                  </div>
                </div>
              </div>
            </button>
            <button
              onClick={(e) => handleRemove(item.id, e)}
              className="absolute top-3 right-3 p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 rounded z-10"
              aria-label={`ลบประวัติ ${getStationName(item.origin)} ไป ${getStationName(item.destination)}`}
            >
              <X className="w-4 h-4 text-gray-400 hover:text-red-600" />
            </button>
          </div>
        ))}
      </div>

      {history.length > 3 && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium py-1"
        >
          {isExpanded ? 'แสดงน้อยลง' : `แสดงเพิ่มเติม (${history.length - 3})`}
        </button>
      )}
    </div>
  );
}
