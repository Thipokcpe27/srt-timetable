'use client';

import { useEffect, useState } from 'react';
import { Eye } from 'lucide-react';

export default function VisitCounter() {
  const [visits, setVisits] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get current visit count from localStorage
    const currentVisits = parseInt(localStorage.getItem('srt-visit-count') || '0', 10);
    const newVisits = currentVisits + 1;
    
    // Update localStorage
    localStorage.setItem('srt-visit-count', newVisits.toString());
    
    // Update state
    setVisits(newVisits);
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-gray-600">
        <Eye className="w-4 h-4" aria-hidden="true" />
        <span className="text-sm">กำลังโหลด...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-gray-700" aria-label={`จำนวนผู้เข้าชม ${visits.toLocaleString()} ครั้ง`}>
      <Eye className="w-4 h-4" aria-hidden="true" />
      <span className="text-sm font-semibold">
        <span className="hidden md:inline">ผู้เข้าชม: </span>
        <span className="text-blue-600">{visits.toLocaleString()}</span>
      </span>
    </div>
  );
}
