'use client';

import { useState } from 'react';
import { Train } from '@/lib/types';
import { getStationName } from '@/lib/trainData';
import { formatPrice, getAvailabilityStatus } from '@/lib/searchUtils';
import {
  MapPin,
  ChevronDown,
  ChevronUp,
  Wifi,
  Utensils,
  Zap,
  Accessibility,
  Luggage,
  Snowflake,
  DoorOpen,
  Bed,
  Zap as Lightning,
  Info,
  Armchair,
  List,
  GitCompare
} from 'lucide-react';

interface TrainCardProps {
  train: Train;
  isSelected?: boolean;
  onToggleCompare?: (train: Train) => void;
}

export default function TrainCard({ train, isSelected = false, onToggleCompare }: TrainCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'classes' | 'timetable'>('timetable');
  const [expandedAmenities, setExpandedAmenities] = useState<{ [key: string]: boolean }>({});
  const cardId = `train-card-${train.id}`;

  const getAmenityIcon = (icon: string) => {
    const iconMap: { [key: string]: JSX.Element } = {
      '📶': <Wifi className="w-4 h-4" />,
      '🔌': <Zap className="w-4 h-4" />,
      '❄️': <Snowflake className="w-4 h-4" />,
      '🍽️': <Utensils className="w-4 h-4" />,
      '♿': <Accessibility className="w-4 h-4" />,
      '🧳': <Luggage className="w-4 h-4" />,
      '🚻': <DoorOpen className="w-4 h-4" />,
      '🛏️': <Bed className="w-4 h-4" />,
    };
    return iconMap[icon] || <span>{icon}</span>;
  };

  const getAvailabilityColor = (status: 'high' | 'medium' | 'low') => {
    switch (status) {
      case 'high':
        return 'text-green-700 bg-green-50 border-green-200';
      case 'medium':
        return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      case 'low':
        return 'text-red-700 bg-red-50 border-red-200';
    }
  };

  // Get train type based on name
  const getTrainType = () => {
    if (train.trainName.includes('ด่วนพิเศษ')) {
      return { label: 'ด่วนพิเศษ', color: 'bg-gradient-to-r from-purple-500 to-purple-600', icon: <Lightning className="w-3 h-3" /> };
    } else if (train.trainName.includes('ด่วน')) {
      return { label: 'ด่วน', color: 'bg-gradient-to-r from-blue-500 to-blue-600', icon: <Lightning className="w-3 h-3" /> };
    }
    return { label: 'ธรรมดา', color: 'bg-gradient-to-r from-gray-500 to-gray-600', icon: null };
  };

  // Get price range
  const prices = train.classes.map(c => c.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const trainType = getTrainType();

  // Generate timetable stops
  const allStops = [
    { station: train.origin, time: train.departureTime, type: 'departure' },
    ...train.stops.map(stop => ({ station: stop, time: '-', type: 'stop' })),
    { station: train.destination, time: train.arrivalTime, type: 'arrival' }
  ];

  return (
    <article
      id={cardId}
      className="backdrop-blur-md bg-white/90 rounded-2xl border border-gray-100/50 overflow-hidden hover:border-blue-200/60 transition-all duration-300 transform hover:-translate-y-1 animate-scale-in min-h-[250px]"
      aria-labelledby={`${cardId}-title`}
    >
      {/* Header */}
      <header className="backdrop-blur-sm bg-gradient-to-r from-blue-50/30 to-indigo-50/30 border-b border-gray-200/30 px-4 md:px-6 py-3 md:py-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-start justify-between gap-3">
          <div className="flex-1 w-full sm:w-auto">
            {/* Badge and Train Number on top */}
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className={`${trainType.color} text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md`} aria-label={`ประเภทรถไฟ ${trainType.label}`}>
                {trainType.icon && <span aria-hidden="true">{trainType.icon}</span>}
                {trainType.label}
              </span>
              <span className="text-sm md:text-base font-bold text-gray-700">ขบวนที่ {train.trainNumber}</span>
            </div>
            {/* Train Name */}
            <h3 id={`${cardId}-title`} className="text-sm md:text-base font-bold text-gray-900 drop-shadow-sm">{train.trainName}</h3>
          </div>
          <div className="text-left sm:text-right w-full sm:w-auto" role="region" aria-label="ข้อมูลราคา">
            <div className="text-xs md:text-sm text-gray-700 mb-1 font-medium">ราคาเริ่มต้น</div>
            <div className="text-xl md:text-2xl font-bold text-gray-900 drop-shadow-sm" aria-label={minPrice !== maxPrice ? `ราคา ${formatPrice(minPrice)} ถึง ${formatPrice(maxPrice)}` : `ราคา ${formatPrice(minPrice)}`}>
              {formatPrice(minPrice)}
              {minPrice !== maxPrice && (
                <span className="text-xl md:text-2xl font-bold text-gray-900"> - {formatPrice(maxPrice)}</span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Journey Info */}
      <div className="px-4 md:px-6 py-4 md:py-6" role="region" aria-label="ข้อมูลเส้นทางและเวลาเดินทาง">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="w-full md:w-48 text-center md:text-left flex-shrink-0">
            <div className="text-xs md:text-sm text-gray-700 mb-1 font-medium">ออกเดินทาง</div>
            <time className="text-2xl md:text-3xl font-bold text-gray-900 drop-shadow-sm" aria-label={`เวลาออกเดินทาง ${train.departureTime}`}>{train.departureTime}</time>
            <div className="text-xs md:text-sm text-gray-700 flex items-center gap-1 mt-2 justify-center md:justify-start">
              <MapPin className="w-3 h-3 md:w-4 md:h-4 text-blue-600" aria-hidden="true" />
              <span className="font-medium">{getStationName(train.origin)}</span>
            </div>
          </div>

          <div className="flex-shrink-0 px-2 md:px-8 flex flex-col items-center flex-1" aria-label={`ระยะเวลาเดินทาง ${train.duration}`}>
            <div className="text-xs md:text-sm font-semibold text-gray-700 mb-3">{train.duration}</div>
            {/* Connecting Dotted Line */}
            <div className="relative flex items-center justify-center w-full min-w-[150px]" aria-hidden="true">
              <div className="absolute w-full h-0.5 border-t-2 border-dashed border-blue-500"></div>
              <div className="absolute left-0 w-2 h-2 rounded-full bg-blue-500 shadow-md"></div>
              <div className="absolute right-0 w-2 h-2 rounded-full bg-blue-500 shadow-md"></div>
              <div className="absolute w-3 h-3 rounded-full bg-blue-600 border-2 border-white shadow-lg"></div>
            </div>
            {/* Distance Information */}
            <div className="text-xs text-gray-600 mt-4 font-medium">
              <span className="text-blue-600">~{Math.floor(parseInt(train.duration.split(':')[0]) * 60 + parseInt(train.duration.split(':')[1]) * 1.2)} กม.</span>
            </div>
          </div>

          <div className="w-full md:w-48 text-center md:text-right flex-shrink-0">
            <div className="text-xs md:text-sm text-gray-700 mb-1 font-medium">ถึงปลายทาง</div>
            <time className="text-2xl md:text-3xl font-bold text-gray-900 drop-shadow-sm" aria-label={`เวลาถึงปลายทาง ${train.arrivalTime}`}>{train.arrivalTime}</time>
            <div className="text-xs md:text-sm text-gray-700 flex items-center gap-1 mt-2 justify-center md:justify-end">
              <MapPin className="w-3 h-3 md:w-4 md:h-4 text-blue-600" aria-hidden="true" />
              <span className="font-medium">{getStationName(train.destination)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="border-t border-gray-200/50 flex">
        {/* Expand/Collapse Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          aria-expanded={isExpanded}
          aria-controls={`${cardId}-details`}
          aria-label={isExpanded ? 'ซ่อนรายละเอียดรถไฟ' : 'ดูรายละเอียดรถไฟและเลือกชั้นที่นั่ง'}
          className={`px-6 py-3.5 backdrop-blur-sm bg-gradient-to-r from-gray-50/60 to-blue-50/40 hover:from-gray-100/70 hover:to-blue-100/50 flex items-center justify-between transition-all duration-200 ${
            onToggleCompare ? 'flex-1 border-r border-gray-200/50' : 'w-full'
          }`}
        >
          <span className="text-sm font-semibold text-gray-700">
            {isExpanded ? 'ซ่อนรายละเอียด' : 'ดูรายละเอียดและเลือกชั้นที่นั่ง'}
          </span>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-600" aria-hidden="true" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-600" aria-hidden="true" />
          )}
        </button>

        {/* Compare Button */}
        {onToggleCompare && (
          <button
            onClick={() => onToggleCompare(train)}
            className={`flex-1 px-6 py-3.5 backdrop-blur-sm flex items-center justify-center gap-2 transition-all duration-200 ${
              isSelected
                ? 'bg-purple-100/70 hover:bg-purple-200/70 text-purple-700'
                : 'bg-gradient-to-r from-gray-50/60 to-blue-50/40 hover:from-gray-100/70 hover:to-blue-100/50 text-gray-700'
            }`}
            aria-label={isSelected ? 'นำออกจากการเปรียบเทียบ' : 'เพิ่มเข้าการเปรียบเทียบ'}
          >
            <GitCompare className="w-5 h-5" aria-hidden="true" />
            <span className="text-sm font-semibold">
              {isSelected ? 'นำออกจากการเปรียบเทียบ' : 'เปรียบเทียบ'}
            </span>
          </button>
        )}
      </div>

      {/* Expanded Content with Tabs */}
      {isExpanded && (
        <div id={`${cardId}-details`} className="border-t border-gray-200/50 animate-slide-down">
          {/* Tab Headers */}
          <div className="flex border-b border-gray-200/50 backdrop-blur-sm bg-gray-50/40 overflow-x-auto" role="tablist" aria-label="ข้อมูลรายละเอียดรถไฟ">
            <button
              onClick={() => setActiveTab('timetable')}
              role="tab"
              aria-selected={activeTab === 'timetable'}
              aria-controls={`${cardId}-timetable`}
              id={`${cardId}-timetable-tab`}
              className={`flex-1 min-w-fit px-4 md:px-6 py-3 md:py-3.5 text-xs md:text-sm font-semibold transition-all flex items-center justify-center gap-1 md:gap-2 ${
                activeTab === 'timetable'
                  ? 'text-blue-700 border-b-2 border-blue-600 bg-white/60'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-white/40'
              }`}
            >
              <List className="w-3 h-3 md:w-4 md:h-4" aria-hidden="true" />
              <span className="whitespace-nowrap">ตารางเวลา</span>
            </button>
            <button
              onClick={() => setActiveTab('classes')}
              role="tab"
              aria-selected={activeTab === 'classes'}
              aria-controls={`${cardId}-classes`}
              id={`${cardId}-classes-tab`}
              className={`flex-1 min-w-fit px-4 md:px-6 py-3 md:py-3.5 text-xs md:text-sm font-semibold transition-all flex items-center justify-center gap-1 md:gap-2 ${
                activeTab === 'classes'
                  ? 'text-blue-700 border-b-2 border-blue-600 bg-white/60'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-white/40'
              }`}
            >
              <Armchair className="w-3 h-3 md:w-4 md:h-4" aria-hidden="true" />
              <span className="whitespace-nowrap">ชั้นที่นั่ง</span>
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Timetable Tab */}
            {activeTab === 'timetable' && (
              <div
                id={`${cardId}-timetable`}
                role="tabpanel"
                aria-labelledby={`${cardId}-timetable-tab`}
                className="space-y-2"
              >
                {allStops.map((stop, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      stop.type === 'departure'
                        ? 'bg-green-50/80 border border-green-200/60'
                        : stop.type === 'arrival'
                        ? 'bg-red-50/80 border border-red-200/60'
                        : 'bg-gray-50/80 border border-gray-200/60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        stop.type === 'departure' ? 'bg-green-500' :
                        stop.type === 'arrival' ? 'bg-red-500' : 'bg-gray-400'
                      }`}></div>
                      <div>
                        <div className="font-semibold text-gray-900">{getStationName(stop.station)}</div>
                        {stop.type === 'departure' && <div className="text-xs text-gray-600">สถานีต้นทาง</div>}
                        {stop.type === 'arrival' && <div className="text-xs text-gray-600">สถานีปลายทาง</div>}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-gray-900">{stop.time}</div>
                      {stop.type === 'stop' && <div className="text-xs text-gray-600">แวะจอด</div>}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Classes Tab */}
            {activeTab === 'classes' && (
              <div
                id={`${cardId}-classes`}
                role="tabpanel"
                aria-labelledby={`${cardId}-classes-tab`}
                className="space-y-3"
              >
                {train.classes.map((trainClass) => {
                  const availability = getAvailabilityStatus(trainClass.available, trainClass.totalSeats);
                  const canBook = trainClass.available > 0;
                  const showAmenities = expandedAmenities[trainClass.id] || false;

                  // Find amenities for this class
                  const classAmenities = train.amenities;

                  return (
                    <article
                      key={trainClass.id}
                      className="backdrop-blur-sm bg-white/60 border border-gray-200/60 rounded-xl p-4 hover:border-blue-400 hover:shadow-lg transition-all duration-200"
                      aria-labelledby={`${cardId}-class-${trainClass.id}`}
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span
                              id={`${cardId}-class-${trainClass.id}`}
                              className="px-3 py-1.5 bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 text-sm font-bold rounded-lg shadow-sm"
                            >
                              {trainClass.name}
                            </span>
                            <span
                              className={`text-xs px-2.5 py-1 rounded-full border font-semibold ${getAvailabilityColor(availability.status)}`}
                              role="status"
                              aria-label={`ที่นั่งว่าง ${trainClass.available} ที่นั่ง สถานะ ${availability.status === 'high' ? 'มาก' : availability.status === 'medium' ? 'ปานกลาง' : 'น้อย'}`}
                            >
                              เหลือ {trainClass.available} ที่นั่ง
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1.5 text-xs text-gray-700 mb-2">
                            {trainClass.features.map((feature, idx) => (
                              <span key={idx} className="font-medium">
                                {feature}
                                {idx < trainClass.features.length - 1 && ' •'}
                              </span>
                            ))}
                          </div>

                          {/* Amenities Dropdown */}
                          <button
                            onClick={() => setExpandedAmenities(prev => ({ ...prev, [trainClass.id]: !showAmenities }))}
                            aria-expanded={showAmenities}
                            aria-controls={`${cardId}-amenities-${trainClass.id}`}
                            aria-label={showAmenities ? 'ซ่อนสิ่งอำนวยความสะดวก' : 'ดูสิ่งอำนวยความสะดวก'}
                            className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium mt-2"
                          >
                            <Info className="w-3 h-3" aria-hidden="true" />
                            <span>สิ่งอำนวยความสะดวก</span>
                            {showAmenities ? <ChevronUp className="w-3 h-3" aria-hidden="true" /> : <ChevronDown className="w-3 h-3" aria-hidden="true" />}
                          </button>

                          {showAmenities && (
                            <div
                              id={`${cardId}-amenities-${trainClass.id}`}
                              className="mt-3 pt-3 border-t border-gray-200/60 animate-slide-down"
                              role="region"
                              aria-label="รายการสิ่งอำนวยความสะดวก"
                            >
                              <ul className="flex flex-wrap gap-2" role="list">
                                {classAmenities.map((amenity) => (
                                  <li
                                    key={amenity.id}
                                    className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1.5 rounded-md text-xs text-gray-700"
                                  >
                                    <span aria-hidden="true">{getAmenityIcon(amenity.icon)}</span>
                                    <span className="font-medium">{amenity.name}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="text-sm text-gray-700 font-medium">ราคา</div>
                            <div className="text-2xl font-bold text-gray-900 drop-shadow-sm" aria-label={`ราคา ${formatPrice(trainClass.price)}`}>
                              {formatPrice(trainClass.price)}
                            </div>
                          </div>

                          <button
                            disabled={!canBook}
                            aria-label={canBook ? `จองชั้น ${trainClass.name} ราคา ${formatPrice(trainClass.price)}` : `ชั้น ${trainClass.name} ที่นั่งเต็ม`}
                            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm font-bold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-blue-600"
                          >
                            {canBook ? 'จอง' : 'เต็ม'}
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}

          </div>
        </div>
      )}
    </article>
  );
}
