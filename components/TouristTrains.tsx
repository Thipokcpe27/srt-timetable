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
    image: 'https://images.unsplash.com/photo-1590267099372-0a46d371f6fa?w=600&h=400&fit=crop',
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
    image: 'https://images.unsplash.com/photo-1563492065567-44eebec50c48?w=600&h=400&fit=crop',
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
    <section id="srt-trips" className="max-w-7xl mx-auto mb-16" aria-labelledby="tourist-trains-heading">
      {/* Header */}
      <div className="mb-8 text-center">
        <h2 id="tourist-trains-heading" className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          SRT Trips
        </h2>
        <p className="text-gray-600">แพ็คเกจท่องเที่ยวรถไฟพิเศษ</p>
      </div>

      {/* Cards Grid - Simple design with just images and titles */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {touristTrains.map((train) => (
          <a
            key={train.id}
            href="#"
            className="group relative overflow-hidden rounded-xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
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
        ))}
      </div>


    </section>
  );
}
