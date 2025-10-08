'use client';

import { useState } from 'react';
import { SearchParams, Train } from '@/lib/types';
import { searchTrains } from '@/lib/searchUtils';
import { searchHistoryService } from '@/lib/searchHistory';
import TrainSearch from '@/components/TrainSearch';
import TrainResults from '@/components/TrainResults';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import SearchHistory from '@/components/SearchHistory';
import EmptyState from '@/components/EmptyState';
import PopularTrains from '@/components/PopularTrains';
import VisitCounter from '@/components/VisitCounter';
import { Train as TrainIcon, Clock, Shield, CreditCard, Headphones, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Youtube, Heart } from 'lucide-react';
import AccessibilityToolbar from '@/components/AccessibilityToolbar';
import TrainComparison from '@/components/TrainComparison';
import { useToast } from '@/components/ToastContainer';

export default function Home() {
  const { showToast } = useToast();
  const [searchResults, setSearchResults] = useState<Train[] | null>(null);
  const [searchParams, setSearchParams] = useState<SearchParams | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const [selectedTrains, setSelectedTrains] = useState<Train[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  const [initialSearchValues, setInitialSearchValues] = useState<SearchParams | undefined>();

  const handleSearch = async (params: SearchParams) => {
    setIsLoading(true);
    setAnnouncement('กำลังค้นหารถไฟ กรุณารอสักครู่');
    setSelectedTrains([]); // Clear selected trains on new search

    // Simulate API call delay (reduced for better performance)
    await new Promise(resolve => setTimeout(resolve, 100));

    const results = searchTrains(params);
    setSearchResults(results);
    setSearchParams(params);
    setIsLoading(false);

    // Save to search history
    searchHistoryService.addToHistory(params);

    // Announce results to screen readers
    if (results.length === 0) {
      setAnnouncement('ไม่พบรถไฟที่ตรงกับเงื่อนไขการค้นหา');
    } else {
      setAnnouncement(`พบรถไฟ ${results.length} ขบวน จากสถานี ${params.origin} ไปยังสถานี ${params.destination}`);
    }
  };

  const handleToggleCompare = (train: Train) => {
    setSelectedTrains(prev => {
      const isSelected = prev.some(t => t.id === train.id);
      if (isSelected) {
        showToast('info', `นำ ${train.trainName} ออกจากการเปรียบเทียบแล้ว`);
        return prev.filter(t => t.id !== train.id);
      } else {
        if (prev.length >= 4) {
          showToast('warning', 'สามารถเปรียบเทียบได้สูงสุด 4 ขบวนเท่านั้น');
          return prev;
        }
        showToast('success', `เพิ่ม ${train.trainName} เข้าการเปรียบเทียบแล้ว`);
        return [...prev, train];
      }
    });
  };

  const handleRemoveTrain = (trainId: string) => {
    const train = selectedTrains.find(t => t.id === trainId);
    setSelectedTrains(prev => prev.filter(t => t.id !== trainId));
    if (train) {
      showToast('info', `นำ ${train.trainName} ออกจากการเปรียบเทียบแล้ว`);
    }
  };

  const handleShowComparison = () => {
    if (selectedTrains.length < 2) {
      showToast('warning', 'กรุณาเลือกรถไฟอย่างน้อย 2 ขบวนเพื่อเปรียบเทียบ');
      return;
    }
    setShowComparison(true);
  };

  const handlePopularTrainClick = (trainId: string, origin: string, destination: string) => {
    const params = { origin, destination };
    setInitialSearchValues(params);
    handleSearch(params);
    showToast('info', `กำลังค้นหา ${origin} → ${destination}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 relative">
      {/* Screen reader announcements */}
      <div
        role="status"
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
      >
        {announcement}
      </div>

      {/* Skip to main content link for keyboard navigation */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-6 focus:py-3 focus:bg-blue-700 focus:text-white focus:font-bold focus:rounded-lg focus:shadow-lg"
        aria-label="ข้ามไปยังเนื้อหาหลัก"
      >
        ข้ามไปยังเนื้อหาหลัก
      </a>

      {/* Subtle background decoration - Optimized */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100/10 rounded-full blur-3xl opacity-50" style={{ willChange: 'auto' }}></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-100/10 rounded-full blur-3xl opacity-50" style={{ willChange: 'auto' }}></div>
      </div>

      {/* Header */}
      <header className="backdrop-blur-md bg-white/80 shadow-sm border-b border-white/20 relative z-10 sticky top-0 min-h-[72px]" role="banner">
        <div className="container mx-auto px-4 py-4 md:py-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 flex-shrink-0 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                <TrainIcon className="w-6 h-6 text-white drop-shadow-md" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-gray-900 drop-shadow-sm">
                  SRT Timetable
                </h1>
                <p className="text-xs md:text-sm text-gray-600 font-medium">
                  การรถไฟแห่งประเทศไทย
                </p>
              </div>
            </div>

            {/* Accessibility Toolbar */}
            <AccessibilityToolbar />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main id="main-content" role="main">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-8 md:py-12 relative z-10" aria-labelledby="hero-heading">
          <div className="text-center mb-8 md:mb-10">
            <h2 id="hero-heading" className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 drop-shadow-sm" style={{ contentVisibility: 'auto' }}>
              ค้นหาตารางรถไฟ
            </h2>
            <p className="text-base md:text-lg text-gray-700 font-medium">
              เลือกเส้นทางเพื่อดูรายละเอียดรถไฟและราคา
            </p>
          </div>

          {/* Search Form */}
          <div className="max-w-4xl mx-auto mb-8 md:mb-10 relative z-30">
            <span className="sr-only">
              แบบฟอร์มค้นหารถไฟ กรอกข้อมูลสถานีต้นทาง ปลายทาง วันที่ และจำนวนผู้โดยสาร แล้วกดปุ่มค้นหารถไฟ
            </span>
            <TrainSearch onSearch={handleSearch} isLoading={isLoading} initialValues={initialSearchValues} />
          </div>

          {/* Popular Routes & Search History */}
          {!isLoading && searchResults === null && (
            <div className="max-w-6xl mx-auto mb-12 md:mb-16 relative z-10 space-y-8">
              {/* Popular Trains - Real-time Carousel */}
              <PopularTrains onTrainClick={handlePopularTrainClick} />
              
              {/* Search History */}
              <SearchHistory onSelectHistory={(item) => {
                setInitialSearchValues(item);
                handleSearch(item);
              }} />
            </div>
          )}

          {/* Content Area - Prevent layout shift */}
          <div className="relative">
            {/* Loading State */}
            {isLoading && (
              <div className="max-w-5xl mx-auto mb-16 relative z-10" role="status" aria-live="polite">
                <LoadingSkeleton />
              </div>
            )}

            {/* Results - Overlay on top when available */}
            {!isLoading && searchResults !== null && searchParams && (
              <div id="results" className="max-w-5xl mx-auto mb-16 relative z-10 bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100" role="region" aria-live="polite" aria-label="ผลการค้นหารถไฟ">
                <TrainResults
                  trains={searchResults}
                  searchParams={searchParams}
                  selectedTrains={selectedTrains}
                  onToggleCompare={handleToggleCompare}
                />
              </div>
            )}

            {/* Features Section - Always in DOM, hidden when results shown or loading */}
            <div className={searchResults !== null || isLoading ? 'invisible' : 'visible'} aria-hidden={searchResults !== null || isLoading}>
              {/* Features Grid */}
              <div className="max-w-6xl mx-auto mb-16" role="region" aria-labelledby="features-heading">
              <h3 id="features-heading" className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-8 drop-shadow-sm">
                คุณสมบัติของระบบ
              </h3>
              <div className="grid md:grid-cols-3 gap-6">
                <article className="backdrop-blur-md bg-white/80 rounded-xl border border-gray-100/80 p-6 shadow-card hover:shadow-card-hover transition-all duration-300 transform hover:-translate-y-1 min-h-[180px]">
                  <div className="w-14 h-14 flex-shrink-0 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4 shadow-lg" aria-hidden="true">
                    <Clock className="w-7 h-7 text-white drop-shadow-md" />
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 mb-2 drop-shadow-sm">ค้นหาง่าย ใช้งานสะดวก</h4>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    ค้นหาตารางรถไฟได้รวดเร็ว อินเทอร์เฟซเข้าใจง่าย ใช้งานสะดวก
                  </p>
                </article>

                <article className="backdrop-blur-md bg-white/80 rounded-xl border border-gray-100/80 p-6 shadow-card hover:shadow-card-hover transition-all duration-300 transform hover:-translate-y-1 min-h-[180px]">
                  <div className="w-14 h-14 flex-shrink-0 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-4 shadow-lg" aria-hidden="true">
                    <Shield className="w-7 h-7 text-white drop-shadow-md" />
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 mb-2 drop-shadow-sm">ข้อมูลครบถ้วน</h4>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    แสดงข้อมูลรถไฟทุกขบวน เวลา ราคา และสิ่งอำนวยความสะดวก
                  </p>
                </article>

                <article className="backdrop-blur-md bg-white/80 rounded-xl border border-gray-100/80 p-6 shadow-card hover:shadow-card-hover transition-all duration-300 transform hover:-translate-y-1 min-h-[180px]">
                  <div className="w-14 h-14 flex-shrink-0 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 shadow-lg" aria-hidden="true">
                    <CreditCard className="w-7 h-7 text-white drop-shadow-md" />
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 mb-2 drop-shadow-sm">แสดงราคาชัดเจน</h4>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    ดูราคาทุกชั้นที่นั่งแยกตามประเภทผู้โดยสาร
                  </p>
                </article>
              </div>
              </div>

              {/* How It Works Section */}
              <section className="max-w-5xl mx-auto mb-16" aria-labelledby="how-it-works-heading">
                <h3 id="how-it-works-heading" className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-8 drop-shadow-sm">
                  วิธีการใช้งาน
                </h3>
                <ol className="grid md:grid-cols-3 gap-8 list-none">
                  <li className="text-center min-h-[160px]">
                    <div className="w-16 h-16 flex-shrink-0 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md" aria-hidden="true">
                      <span className="text-2xl font-bold text-blue-700 drop-shadow-sm">1</span>
                    </div>
                    <h4 className="text-lg font-bold text-gray-900 mb-2 drop-shadow-sm">เลือกเส้นทาง</h4>
                    <p className="text-gray-700 text-sm">
                      เลือกสถานีต้นทาง ปลายทาง วันที่ และจำนวนผู้โดยสาร
                    </p>
                  </li>

                  <li className="text-center min-h-[160px]">
                    <div className="w-16 h-16 flex-shrink-0 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md" aria-hidden="true">
                      <span className="text-2xl font-bold text-blue-700 drop-shadow-sm">2</span>
                    </div>
                    <h4 className="text-lg font-bold text-gray-900 mb-2 drop-shadow-sm">กดค้นหา</h4>
                    <p className="text-gray-700 text-sm">
                      กดปุ่มค้นหารถไฟเพื่อดูขบวนรถที่ตรงกับเงื่อนไข
                    </p>
                  </li>

                  <li className="text-center min-h-[160px]">
                    <div className="w-16 h-16 flex-shrink-0 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md" aria-hidden="true">
                      <span className="text-2xl font-bold text-blue-700 drop-shadow-sm">3</span>
                    </div>
                    <h4 className="text-lg font-bold text-gray-900 mb-2 drop-shadow-sm">ดูรายละเอียด</h4>
                    <p className="text-gray-700 text-sm">
                      ตรวจสอบเวลา ราคา สิ่งอำนวยความสะดวก และชั้นที่นั่ง
                    </p>
                  </li>
                </ol>
              </section>

              {/* Support Section */}
              <section className="max-w-4xl mx-auto" aria-labelledby="support-heading">
                <div className="backdrop-blur-md bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl border border-gray-100/80 p-8 text-center shadow-card hover:shadow-card-hover transition-all duration-300 transform hover:-translate-y-1 min-h-[220px]">
                  <div className="w-16 h-16 flex-shrink-0 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg" aria-hidden="true">
                    <Headphones className="w-8 h-8 text-white drop-shadow-md" />
                  </div>
                  <h3 id="support-heading" className="text-2xl font-bold text-gray-900 mb-3 drop-shadow-sm">
                    ต้องการความช่วยเหลือ?
                  </h3>
                  <p className="text-gray-700 mb-5 font-medium">
                    ทีมงานของเราพร้อมให้บริการตลอด 24 ชั่วโมง
                  </p>
                  <button
                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                    aria-label="ติดต่อทีมสนับสนุน"
                  >
                    ติดต่อเรา
                  </button>
                </div>
              </section>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="backdrop-blur-sm bg-gradient-to-b from-white/70 to-gray-50/70 border-t border-white/30 mt-16 relative z-10" role="contentinfo">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* About Section */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-md">
                  <TrainIcon className="w-5 h-5 text-white" aria-hidden="true" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">SRT Timetable</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                ระบบค้นหาตารางรถไฟที่สะดวก รวดเร็ว และใช้งานง่าย สำหรับการเดินทางของคุณ
              </p>
              <div className="flex gap-3">
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center transition-colors" aria-label="Facebook">
                  <Facebook className="w-4 h-4" aria-hidden="true" />
                </a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-sky-500 hover:bg-sky-600 text-white rounded-lg flex items-center justify-center transition-colors" aria-label="Twitter">
                  <Twitter className="w-4 h-4" aria-hidden="true" />
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-pink-600 hover:bg-pink-700 text-white rounded-lg flex items-center justify-center transition-colors" aria-label="Instagram">
                  <Instagram className="w-4 h-4" aria-hidden="true" />
                </a>
                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center justify-center transition-colors" aria-label="YouTube">
                  <Youtube className="w-4 h-4" aria-hidden="true" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wide">ลิงก์ด่วน</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#main-content" className="text-gray-600 hover:text-blue-600 transition-colors">หน้าแรก</a>
                </li>
                <li>
                  <a href="#features" className="text-gray-600 hover:text-blue-600 transition-colors">คุณสมบัติ</a>
                </li>
                <li>
                  <a href="#how-it-works" className="text-gray-600 hover:text-blue-600 transition-colors">วิธีใช้งาน</a>
                </li>
                <li>
                  <a href="https://www.railway.co.th" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-blue-600 transition-colors">เว็บไซต์ SRT</a>
                </li>
                <li>
                  <a href="https://www.railway.co.th/TicketBooking" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-blue-600 transition-colors">จองตั๋วออนไลน์</a>
                </li>
              </ul>
            </div>

            {/* Legal Links */}
            <div>
              <h4 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wide">นโยบาย</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">เกี่ยวกับเรา</a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">นโยบายความเป็นส่วนตัว</a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">ข้อกำหนดการใช้งาน</a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">คำถามที่พบบ่อย (FAQ)</a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">ช่วยเหลือ</a>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wide">ติดต่อเรา</h4>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                  <span className="text-gray-600">
                    การรถไฟแห่งประเทศไทย<br />
                    ถนนวงศ์สว่าง แขวงบางซื่อ<br />
                    เขตบางซื่อ กรุงเทพฯ 10800
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-blue-600 flex-shrink-0" aria-hidden="true" />
                  <a href="tel:1690" className="text-gray-600 hover:text-blue-600 transition-colors">
                    โทร. 1690
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-blue-600 flex-shrink-0" aria-hidden="true" />
                  <a href="mailto:contact@railway.co.th" className="text-gray-600 hover:text-blue-600 transition-colors">
                    contact@railway.co.th
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-200/50 pt-6 mt-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-sm text-gray-600 text-center md:text-left">
                © 2025 SRT Timetable. สงวนลิขสิทธิ์.
              </p>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>Made with</span>
                <Heart className="w-4 h-4 text-red-500 fill-red-500" aria-hidden="true" />
                <span>for Thailand</span>
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>v1.0.0</span>
                <span>•</span>
                <VisitCounter />
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Comparison Floating Button */}
      {selectedTrains.length > 0 && (
        <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-40 animate-slide-in-right">
          <button
            onClick={handleShowComparison}
            className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-4 py-3 md:px-6 md:py-4 rounded-full shadow-2xl flex items-center gap-2 md:gap-3 font-bold transition-all hover:scale-105 active:scale-95"
            aria-label={`เปรียบเทียบรถไฟที่เลือก ${selectedTrains.length} ขบวน`}
          >
            <span className="bg-white text-purple-700 rounded-full w-7 h-7 md:w-8 md:h-8 flex items-center justify-center font-bold text-sm md:text-base">
              {selectedTrains.length}
            </span>
            <span className="text-sm md:text-base">เปรียบเทียบ</span>
          </button>
        </div>
      )}

      {/* Comparison Modal */}
      {showComparison && (
        <TrainComparison
          trains={selectedTrains}
          onRemoveTrain={handleRemoveTrain}
          onClose={() => setShowComparison(false)}
        />
      )}
    </div>
  );
}
