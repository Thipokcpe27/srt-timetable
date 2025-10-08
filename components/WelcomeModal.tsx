'use client';

import { useState, useEffect } from 'react';
import { X, Clock, Bell, Sparkles, TrendingUp, Info } from 'lucide-react';

interface WelcomeModalProps {
  onClose?: () => void;
}

export default function WelcomeModal({ onClose }: WelcomeModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [entryTime, setEntryTime] = useState<string>('');
  const [entryDate, setEntryDate] = useState<string>('');

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
        second: '2-digit'
      }));
      setEntryDate(now.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
      }));
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    // Remember that user has seen the modal today
    localStorage.setItem('welcome-modal-last-seen', new Date().toDateString());
    onClose?.();
  };

  if (!isVisible) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-fade-in"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-modal-title"
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-auto animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Gradient */}
        <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white p-8 rounded-t-2xl overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-24 -translate-x-24"></div>
          
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors z-10"
            aria-label="ปิด"
          >
            <X className="w-6 h-6" aria-hidden="true" />
          </button>

          {/* Content */}
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6" aria-hidden="true" />
              </div>
              <h2 id="welcome-modal-title" className="text-3xl font-bold">
                ยินดีต้อนรับ!
              </h2>
            </div>
            
            <p className="text-blue-100 text-lg mb-6">
              SRT Timetable - ระบบค้นหาตารางรถไฟ
            </p>

            {/* Entry Time Display */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5" aria-hidden="true" />
                <span className="font-semibold">เวลาเข้าชมเว็บไซต์</span>
              </div>
              <div className="text-2xl font-bold mb-1">{entryTime}</div>
              <div className="text-sm text-blue-100">{entryDate}</div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          {/* News/Announcements */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-lg font-bold text-gray-900">
              <Bell className="w-5 h-5 text-blue-600" aria-hidden="true" />
              <h3>ข่าวสารและประกาศสำคัญ</h3>
            </div>

            {/* Announcement 1 */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-200/50">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-5 h-5 text-white" aria-hidden="true" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900 mb-2">🎉 ฟีเจอร์ใหม่: รถไฟยอดนิยม!</h4>
                  <p className="text-sm text-gray-700 mb-2">
                    ตอนนี้คุณสามารถดูรถไฟที่ได้รับความนิยมสูงสุดแบบเรียลไทม์ พร้อมระบบแนะนำเส้นทางที่ดีที่สุด
                  </p>
                  <span className="inline-block text-xs px-2 py-1 bg-blue-600 text-white rounded-full">ใหม่</span>
                </div>
              </div>
            </div>

            {/* Announcement 2 */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-5 border border-purple-200/50">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-white" aria-hidden="true" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900 mb-2">🚂 SRT Trips - รถไฟท่องเที่ยว</h4>
                  <p className="text-sm text-gray-700 mb-2">
                    ค้นพบแพ็คเกจท่องเที่ยวพิเศษ! ตั้งแต่รถไฟหรู Eastern & Oriental Express ไปจนถึงทริปสายมรณะแม่น้ำแคว
                  </p>
                  <span className="inline-block text-xs px-2 py-1 bg-purple-600 text-white rounded-full">แนะนำ</span>
                </div>
              </div>
            </div>

            {/* Announcement 3 - Promotion */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-5 border border-green-200/50">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Info className="w-5 h-5 text-white" aria-hidden="true" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900 mb-2">💳 โปรโมชั่นพิเศษ!</h4>
                  <p className="text-sm text-gray-700 mb-2">
                    ลด 20% สำหรับการจองรถไฟชั้น 1 ทุกเส้นทาง ใช้โค้ด <code className="px-2 py-0.5 bg-green-600 text-white rounded font-mono text-xs">SRT2025</code>
                  </p>
                  <p className="text-xs text-gray-600">
                    *เงื่อนไขเป็นไปตามที่บริษัทกำหนด ใช้ได้ถึง 31 ธ.ค. 2025
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Features Highlight */}
          <div className="bg-gray-50 rounded-xl p-5">
            <h4 className="font-bold text-gray-900 mb-3">✨ คุณสมบัติเด่น</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                <span>ค้นหารถไฟแบบเรียลไทม์</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                <span>เปรียบเทียบราคาและเวลาเดินทาง</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                <span>แพ็คเกจท่องเที่ยวพิเศษ (SRT Trips)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                <span>รองรับการใช้งานสำหรับผู้พิการทางสายตา (WCAG AAA)</span>
              </li>
            </ul>
          </div>

          {/* Action Button */}
          <button
            onClick={handleClose}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all text-lg"
          >
            เริ่มใช้งานเลย! 🚀
          </button>

          {/* Footer Note */}
          <p className="text-center text-xs text-gray-500">
            ป๊อปอัปนี้จะแสดงเพียงครั้งเดียวต่อวัน
          </p>
        </div>
      </div>
    </div>
  );
}
