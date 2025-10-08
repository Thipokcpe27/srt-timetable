'use client';

import { useState } from 'react';
import { MapPin, Clock, Users, Star, Calendar, ArrowRight, Sparkles } from 'lucide-react';

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
    image: '🚂',
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
    image: '🌉',
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
    image: '🌙',
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
    image: '🏖️',
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
    image: '🛕',
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
    image: '🏝️',
    available: true,
    category: 'adventure',
  },
];

const categoryColors = {
  luxury: 'from-purple-500 to-pink-500',
  cultural: 'from-amber-500 to-orange-500',
  scenic: 'from-blue-500 to-cyan-500',
  adventure: 'from-green-500 to-emerald-500',
};

const categoryLabels = {
  luxury: 'หรูหรา',
  cultural: 'วัฒนธรรม',
  scenic: 'ธรรมชาติ',
  adventure: 'ผจญภัย',
};

export default function TouristTrains() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredTrains = selectedCategory === 'all' 
    ? touristTrains 
    : touristTrains.filter(train => train.category === selectedCategory);

  return (
    <section className="max-w-7xl mx-auto mb-16" aria-labelledby="tourist-trains-heading">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
            <Sparkles className="w-6 h-6 text-white" aria-hidden="true" />
          </div>
          <h2 id="tourist-trains-heading" className="text-3xl md:text-4xl font-bold text-gray-900">
            SRT Trips
          </h2>
        </div>
        <p className="text-lg text-gray-600 mb-6">รถไฟท่องเที่ยว • Tourist Trains</p>
        <p className="text-gray-700 max-w-2xl mx-auto">
          ค้นพบประสบการณ์การเดินทางพิเศษกับรถไฟท่องเที่ยวจากการรถไฟแห่งประเทศไทย
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex items-center justify-center gap-2 md:gap-3 mb-8 flex-wrap">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-4 md:px-6 py-2 rounded-full font-semibold transition-all ${
            selectedCategory === 'all'
              ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          ทั้งหมด
        </button>
        {Object.entries(categoryLabels).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setSelectedCategory(key)}
            className={`px-4 md:px-6 py-2 rounded-full font-semibold transition-all ${
              selectedCategory === key
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTrains.map((train) => (
          <div
            key={train.id}
            className="backdrop-blur-md bg-white/90 rounded-2xl border border-gray-100/50 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group"
          >
            {/* Image/Icon Header */}
            <div className={`relative h-48 bg-gradient-to-br ${categoryColors[train.category]} flex items-center justify-center overflow-hidden`}>
              <div className="text-8xl filter drop-shadow-lg group-hover:scale-110 transition-transform duration-300">
                {train.image}
              </div>
              {/* Category Badge */}
              <div className="absolute top-3 right-3 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-bold text-gray-900">
                {categoryLabels[train.category]}
              </div>
              {/* Rating */}
              <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" aria-hidden="true" />
                <span className="font-bold text-gray-900">{train.rating}</span>
                <span className="text-xs text-gray-600">({train.reviews})</span>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Title */}
              <h3 className="text-xl font-bold text-gray-900 mb-1">
                {train.nameThai}
              </h3>
              <p className="text-sm text-gray-600 mb-3">{train.name}</p>

              {/* Description */}
              <p className="text-sm text-gray-700 mb-4 line-clamp-2">
                {train.description}
              </p>

              {/* Info */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0" aria-hidden="true" />
                  <span className="line-clamp-1">{train.route}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Clock className="w-4 h-4 text-blue-600 flex-shrink-0" aria-hidden="true" />
                  <span>{train.duration}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Calendar className="w-4 h-4 text-blue-600 flex-shrink-0" aria-hidden="true" />
                  <span className="text-green-600 font-semibold">
                    {train.available ? 'เปิดรับจอง' : 'ปิดรับจอง'}
                  </span>
                </div>
              </div>

              {/* Highlights */}
              <div className="mb-4">
                <p className="text-xs font-semibold text-gray-600 mb-2">ไฮไลท์:</p>
                <div className="flex flex-wrap gap-1">
                  {train.highlights.slice(0, 4).map((highlight, index) => (
                    <span
                      key={index}
                      className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded-full"
                    >
                      {highlight}
                    </span>
                  ))}
                </div>
              </div>

              {/* Price & Action */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div>
                  <p className="text-xs text-gray-600">เริ่มต้น</p>
                  <p className="text-2xl font-bold text-blue-600">{train.price}</p>
                </div>
                <button
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all flex items-center gap-2 group-hover:gap-3"
                  aria-label={`ดูรายละเอียด ${train.nameThai}`}
                >
                  <span className="text-sm">ดูเพิ่มเติม</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Call to Action */}
      <div className="mt-12 text-center">
        <div className="backdrop-blur-md bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200/50 p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            สนใจแพ็คเกจท่องเที่ยวเพิ่มเติม?
          </h3>
          <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
            ติดต่อสอบถามข้อมูลเพิ่มเติมหรือจองแพ็คเกจท่องเที่ยวพิเศษ
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <a
              href="tel:1690"
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold rounded-lg shadow-md hover:shadow-lg transition-all"
            >
              โทร. 1690
            </a>
            <a
              href="https://www.railway.co.th"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-white hover:bg-gray-50 text-blue-600 font-bold rounded-lg shadow-md hover:shadow-lg transition-all border-2 border-blue-600"
            >
              เยี่ยมชมเว็บไซต์
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
