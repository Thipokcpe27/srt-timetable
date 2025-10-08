'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

// Sample promotional banners/ads
const promotionalBanners = [
  {
    id: 1,
    title: 'โปรโมชั่นพิเศษ! ลด 20%',
    image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&h=400&fit=crop',
    link: '#',
  },
  {
    id: 2,
    title: 'SRT Trips - แพ็คเกจท่องเที่ยว',
    image: 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=800&h=400&fit=crop',
    link: '#srt-trips',
  },
  {
    id: 3,
    title: 'รถไฟยอดนิยม - เรียลไทม์',
    image: 'https://images.unsplash.com/photo-1590267099372-0a46d371f6fa?w=800&h=400&fit=crop',
    link: '#',
  },
];

interface WelcomeModalProps {
  onClose?: () => void;
}

export default function WelcomeModal({ onClose }: WelcomeModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [entryTime, setEntryTime] = useState<string>('');
  const [entryDate, setEntryDate] = useState<string>('');
  const [currentBanner, setCurrentBanner] = useState(0);

  useEffect(() => {
    // Check if user has seen the modal today
    const lastSeen = localStorage.getItem('welcome-modal-last-seen');
    const today = new Date().toDateString();
    
    if (lastSeen !== today) {
      // Show modal after a short delay for better UX
      setTimeout(() => {
        setIsVisible(true);
      }, 1000);

      // Set entry time
      const now = new Date();
      setEntryTime(now.toLocaleTimeString('th-TH', { 
        hour: '2-digit', 
        minute: '2-digit',
      }));
      setEntryDate(now.toLocaleDateString('th-TH', {
        month: 'long',
        day: 'numeric',
      }));
    }

    // Auto-rotate banners
    const bannerInterval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % promotionalBanners.length);
    }, 3000);

    return () => clearInterval(bannerInterval);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    // Remember that user has seen the modal today
    localStorage.setItem('welcome-modal-last-seen', new Date().toDateString());
    onClose?.();
  };

  if (!isVisible) return null;

  const handleBannerClick = (link: string) => {
    handleClose();
    if (link.startsWith('#')) {
      setTimeout(() => {
        const element = document.querySelector(link);
        element?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-fade-in"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-modal-title"
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-20 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
          aria-label="ปิด"
        >
          <X className="w-5 h-5 text-white" aria-hidden="true" />
        </button>

        {/* Welcome Header with Entry Time */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 id="welcome-modal-title" className="text-2xl font-bold mb-1">
                ยินดีต้อนรับ!
              </h2>
              <p className="text-sm text-blue-100">
                เข้าชมเมื่อ {entryTime} • {entryDate}
              </p>
            </div>
          </div>
        </div>

        {/* Clickable Promotional Banners - Auto-rotating */}
        <div className="relative">
          {promotionalBanners.map((banner, index) => (
            <a
              key={banner.id}
              href={banner.link}
              onClick={(e) => {
                e.preventDefault();
                handleBannerClick(banner.link);
              }}
              className={`block cursor-pointer transition-opacity duration-500 ${
                index === currentBanner ? 'opacity-100' : 'opacity-0 absolute inset-0'
              }`}
            >
              <div className="relative h-96 overflow-hidden">
                <img
                  src={banner.image}
                  alt={banner.title}
                  className="w-full h-full object-cover"
                />
                {/* Overlay with Title */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent flex items-end">
                  <div className="p-8 w-full">
                    <h3 className="text-white text-3xl font-bold mb-2">
                      {banner.title}
                    </h3>
                    <p className="text-white/90 text-sm">คลิกเพื่อดูรายละเอียด →</p>
                  </div>
                </div>
              </div>
            </a>
          ))}

          {/* Dots Indicator */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
            {promotionalBanners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentBanner(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentBanner 
                    ? 'w-8 bg-white' 
                    : 'w-2 bg-white/50 hover:bg-white/75'
                }`}
                aria-label={`ไปยังโปรโมชั่นที่ ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 text-center">
          <p className="text-xs text-gray-600">
            แสดงเพียงครั้งเดียวต่อวัน • คลิกภาพเพื่อดูรายละเอียด
          </p>
        </div>
      </div>
    </div>
  );
}
