'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, X, MapPin, Clock, Star } from 'lucide-react';

interface TouristTrain {
  id: string;
  name: string;
  nameThai: string;
  description: string;
  route: string;
  duration: string;
  price: string;
  rating: number;
  reviews: number;
  highlights: string[];
  image: string;
  available: boolean;
  category: 'cultural' | 'scenic' | 'adventure' | 'luxury';
}

const touristTrains: TouristTrain[] = [
  {
    id: 'TT001',
    name: 'Eastern & Oriental Express',
    nameThai: 'รถไฟหรูตะวันออก',
    description: 'เดินทางสู่ประสบการณ์หรูหราระดับ 5 ดาว พร้อมบริการอาหารและที่พักระดับโลก',
    route: 'กรุงเทพฯ - สิงคโปร์',
    duration: '3 วัน 2 คืน',
    price: '฿89,000',
    rating: 4.9,
    reviews: 234,
    highlights: ['ห้องพักหรู', 'อาหารฝรั่งเศส', 'บาร์เลานจ์', 'วิวทิวทัศน์'],
    image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&h=400&fit=crop',
    available: true,
    category: 'luxury',
  },
  {
    id: 'TT002',
    name: 'River Kwai Train',
    nameThai: 'รถไฟสายมรณะ',
    description: 'สัมผัสประวัติศาสตร์สงครามโลกครั้งที่ 2 และความงามของแม่น้ำแคว',
    route: 'กรุงเทพฯ - กาญจนบุรี - น้ำตก',
    duration: '1 วัน',
    price: '฿1,200',
    rating: 4.7,
    reviews: 892,
    highlights: ['สะพานข้ามแม่น้ำแคว', 'ถ้ำกระแซ', 'น้ำตกไทรโยคน้อย', 'พิพิธภัณฑ์'],
    image: 'https://www.silpa-mag.com/wp-content/uploads/2023/07/Cover-photo-1-2-696x364.jpg?w=600&h=400&fit=crop',
    available: true,
    category: 'cultural',
  },
  {
    id: 'TT003',
    name: 'Chiang Mai Night Train',
    nameThai: 'รถไฟกลางคืนเชียงใหม่',
    description: 'เดินทางกลางคืนสู่เมืองหมอกในแบบผ่อนคลาย พร้อมที่นอนสบาย',
    route: 'กรุงเทพฯ - เชียงใหม่',
    duration: '12 ชั่วโมง (กลางคืน)',
    price: '฿890',
    rating: 4.5,
    reviews: 1234,
    highlights: ['ที่นอนนุ่ม', 'อาหารเช้า', 'วิวพระอาทิตย์ขึ้น', 'ประหยัดค่าที่พัก'],
    image: 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=600&h=400&fit=crop',
    available: true,
    category: 'scenic',
  },
  {
    id: 'TT004',
    name: 'Hua Hin Beach Express',
    nameThai: 'ด่วนพิเศษหัวหิน',
    description: 'หนีร้อนไปชิลริมทะเล ใกล้กรุงเทพฯ เหมาะกับทริปสุดสัปดาห์',
    route: 'กรุงเทพฯ - หัวหิน',
    duration: '4 ชั่วโมง',
    price: '฿450',
    rating: 4.4,
    reviews: 567,
    highlights: ['ทะเลใกล้กรุงเทพฯ', 'ตลาดน้ำ', 'พระราชวัง', 'อาหารทะเล'],
    image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=600&h=400&fit=crop',
    available: true,
    category: 'adventure',
  },
  {
    id: 'TT005',
    name: 'Ayutthaya Heritage Tour',
    nameThai: 'ทัวร์มรดกโลกอยุธยา',
    description: 'สำรวจเมืองหลวงเก่าและโบราณสถานมรดกโลก',
    route: 'กรุงเทพฯ - อยุธยา - กรุงเทพฯ',
    duration: '1 วัน',
    price: '฿680',
    rating: 4.6,
    reviews: 445,
    highlights: ['วัดโบราณ', 'มรดกโลก', 'ตลาดโบราณ', 'อาหารพื้นเมือง'],
    image: 'https://www.asiakingtravel.com/cuploads/files/Ayutthaya-Aerial.jpg?w=600&h=400&fit=crop',
    available: true,
    category: 'cultural',
  },
  {
    id: 'TT006',
    name: 'Southern Paradise Express',
    nameThai: 'ด่วนพิเศษสวรรค์ใต้',
    description: 'ผจญภัยสู่ทะเลใต้ ชายหาดสวยงาม และอาหารทะเลสดใหม่',
    route: 'กรุงเทพฯ - สุราษฎร์ธานี - ภูเก็ต',
    duration: '2 วัน 1 คืน',
    price: '฿2,890',
    rating: 4.8,
    reviews: 678,
    highlights: ['เกาะสมุย', 'ดำน้ำ', 'ชายหาด', 'อาหารทะเล'],
    image: 'https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?w=600&h=400&fit=crop',
    available: true,
    category: 'adventure',
  },
];

export default function TouristTrains() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [selectedTrain, setSelectedTrain] = useState<TouristTrain | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Handle modal open
  const handleTrainClick = (train: TouristTrain, e: React.MouseEvent) => {
    e.preventDefault();
    setSelectedTrain(train);
    setIsModalOpen(true);
    setIsAutoPlaying(false);
  };

  // Handle modal close
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTrain(null);
    setIsAutoPlaying(true);
  };

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isModalOpen) {
        handleCloseModal();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isModalOpen]);

  // Auto-slide functionality
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      handleNext();
    }, 4000); // Auto-slide every 4 seconds

    return () => clearInterval(interval);
  }, [isAutoPlaying, currentIndex]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % touristTrains.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + touristTrains.length) % touristTrains.length);
  };

  const handleDotClick = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
  };

  // Calculate visible cards based on screen size
  const getVisibleCards = () => {
    if (typeof window === 'undefined') return 1;
    if (window.innerWidth >= 1280) return 6; // Desktop: 6 cards
    if (window.innerWidth >= 1024) return 4; // Large tablet: 4 cards
    if (window.innerWidth >= 768) return 3;  // Tablet: 3 cards
    return 2; // Mobile: 2 cards
  };

  return (
    <section id="srt-trips" className="max-w-7xl mx-auto mb-16" aria-labelledby="tourist-trains-heading">
      {/* Header */}
      <div className="mb-6 text-center">
        <h2 id="tourist-trains-heading" className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          SRT Trips
        </h2>
        <p className="text-gray-600">แพ็คเกจท่องเที่ยวรถไฟพิเศษ</p>
      </div>

      {/* Carousel Container */}
      <div className="relative">
        {/* Navigation Buttons */}
        <button
          onClick={() => { handlePrev(); setIsAutoPlaying(false); }}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-10 h-10 bg-white rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 flex items-center justify-center text-gray-700 hover:text-blue-600"
          aria-label="แพ็คเกจก่อนหน้า"
        >
          <ChevronLeft className="w-5 h-5" aria-hidden="true" />
        </button>

        <button
          onClick={() => { handleNext(); setIsAutoPlaying(false); }}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-10 h-10 bg-white rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 flex items-center justify-center text-gray-700 hover:text-blue-600"
          aria-label="แพ็คเกจถัดไป"
        >
          <ChevronRight className="w-5 h-5" aria-hidden="true" />
        </button>

        {/* Cards Container */}
        <div className="overflow-hidden" ref={scrollContainerRef}>
          <div 
            className="flex transition-transform duration-500 ease-out gap-4"
          >
            {touristTrains.map((train) => (
              <div
                key={train.id}
                className="flex-shrink-0"
              >
                <a
                  href="#"
                  onClick={(e) => handleTrainClick(train, e)}
                  className="block group relative overflow-hidden rounded-xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 w-[200px] cursor-pointer"
                >
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden bg-gray-200">
                    <img 
                      src={train.image} 
                      alt={train.nameThai}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  
                  {/* Title */}
                  <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                    <h3 className="text-white font-bold text-sm line-clamp-2">
                      {train.nameThai}
                    </h3>
                  </div>
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Dots Indicator */}
        <div className="flex items-center justify-center gap-2 mt-6">
          {touristTrains.map((_, index) => (
            <button
              key={index}
              onClick={() => handleDotClick(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentIndex 
                  ? 'w-8 bg-blue-600' 
                  : 'w-2 bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`ไปยังแพ็คเกจที่ ${index + 1}`}
              aria-current={index === currentIndex}
            />
          ))}
        </div>
      </div>

      {/* Compact Modal */}
      {isModalOpen && selectedTrain && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={handleCloseModal}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div 
            className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={handleCloseModal}
              className="absolute top-3 right-3 z-10 w-8 h-8 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110"
              aria-label="ปิดหน้าต่าง"
            >
              <X className="w-4 h-4 text-gray-700" />
            </button>

            {/* Compact Image Header */}
            <div className="relative h-40 overflow-hidden bg-gray-200 flex-shrink-0">
              <img 
                src={selectedTrain.image} 
                alt={selectedTrain.nameThai}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
              <div className="absolute bottom-3 left-4 right-4">
                <h2 id="modal-title" className="text-xl font-bold text-white mb-1">
                  {selectedTrain.nameThai}
                </h2>
                <p className="text-sm text-white/90">{selectedTrain.name}</p>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="p-5 overflow-y-auto flex-1">
              {/* Compact Info Bar */}
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="text-sm font-bold text-gray-900">{selectedTrain.rating}</span>
                    <span className="text-xs text-gray-600">({selectedTrain.reviews})</span>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    selectedTrain.available 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {selectedTrain.available ? '✓ มีที่ว่าง' : '✗ เต็ม'}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-600">เริ่มต้น</div>
                  <div className="text-lg font-bold text-blue-600">{selectedTrain.price}</div>
                </div>
              </div>

              {/* Compact Info Grid */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <div className="min-w-0">
                    <div className="text-xs text-gray-600">เส้นทาง</div>
                    <div className="text-sm font-semibold text-gray-900 truncate">{selectedTrain.route}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <Clock className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <div className="min-w-0">
                    <div className="text-xs text-gray-600">ระยะเวลา</div>
                    <div className="text-sm font-semibold text-gray-900 truncate">{selectedTrain.duration}</div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="mb-4">
                <h3 className="text-sm font-bold text-gray-900 mb-2">รายละเอียด</h3>
                <p className="text-sm text-gray-700 leading-relaxed">{selectedTrain.description}</p>
              </div>

              {/* Highlights */}
              <div className="mb-4">
                <h3 className="text-sm font-bold text-gray-900 mb-2">ไฮไลท์ของทริป</h3>
                <div className="grid grid-cols-2 gap-2">
                  {selectedTrain.highlights.map((highlight, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-gray-700">
                      <div className="w-1.5 h-1.5 bg-blue-600 rounded-full flex-shrink-0"></div>
                      <span className="truncate">{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Category Badge */}
              <div className="mb-4">
                <span className="inline-block px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                  {selectedTrain.category === 'luxury' && '🌟 หรูหรา'}
                  {selectedTrain.category === 'cultural' && '🏛️ วัฒนธรรม'}
                  {selectedTrain.category === 'scenic' && '🏞️ ธรรมชาติ'}
                  {selectedTrain.category === 'adventure' && '🎒 ผจญภัย'}
                </span>
              </div>

              {/* Action Button */}
              <button
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all text-sm"
                onClick={() => {
                  window.open('https://www.dticket.railway.co.th/', '_blank');
                }}
              >
                จองตั๋วเดินทาง
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
