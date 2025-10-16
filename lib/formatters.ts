// Helper functions to format data from database to frontend format

/**
 * แปลงนาทีเป็น format "XชM. YนาทีY"
 */
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) {
    return `${mins}นาที`;
  }
  if (mins === 0) {
    return `${hours}ชม.`;
  }
  return `${hours}ชม. ${mins}นาที`;
}

/**
 * แปลง TIME จาก database เป็น string "HH:MM"
 */
export function formatTime(timeString: string): string {
  if (!timeString) return '';
  
  // Handle SQL Server TIME format: "HH:MM:SS.SSSSSSS"
  const parts = timeString.split(':');
  if (parts.length >= 2) {
    return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`;
  }
  
  return timeString;
}

/**
 * แปลง OperatingDays จาก "MON,TUE,WED" เป็น ['mon', 'tue', 'wed'] หรือ ['daily']
 */
export function formatOperatingDays(operatingDays: string | null): string[] {
  if (!operatingDays) return ['daily'];
  
  const days = operatingDays.split(',').map(d => d.trim().toLowerCase());
  
  // ถ้ามีครบทุกวัน
  const allDays = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
  if (days.length === 7 && allDays.every(day => days.includes(day))) {
    return ['daily'];
  }
  
  return days;
}

/**
 * แปลง JSON string เป็น array
 */
export function parseJsonArray(jsonString: string | null): string[] {
  if (!jsonString) return [];
  
  try {
    const parsed = JSON.parse(jsonString);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * แปลง amenities จาก JSON string เป็น Amenity objects
 */
export function formatAmenities(amenitiesJson: string | null): Array<{
  id: string;
  name: string;
  icon: string;
  available: boolean;
}> {
  const amenityMap: Record<string, { name: string; icon: string }> = {
    wifi: { name: 'Wi-Fi ฟรี', icon: '📶' },
    ac: { name: 'เครื่องปรับอากาศ', icon: '❄️' },
    food: { name: 'รถเสบียง', icon: '🍽️' },
    sleeper: { name: 'ที่นอน', icon: '🛏️' },
    power: { name: 'ปลั๊กไฟ', icon: '🔌' },
    accessible: { name: 'เข้าถึงได้สำหรับผู้พิการ', icon: '♿' },
    luggage: { name: 'ที่เก็บกระเป๋า', icon: '🧳' },
    toilet: { name: 'ห้องน้ำ', icon: '🚻' },
  };
  
  const amenityIds = parseJsonArray(amenitiesJson);
  
  return amenityIds.map(id => ({
    id,
    name: amenityMap[id]?.name || id,
    icon: amenityMap[id]?.icon || '✓',
    available: true,
  }));
}

/**
 * แปลง class type เป็น display name
 */
export function formatClassName(classId: string): string {
  const classNames: Record<string, string> = {
    first: 'ชั้น 1',
    business: 'ชั้นธุรกิจ',
    economy: 'ชั้นประหยัด',
    '1': 'ชั้น 1',
    '2': 'ชั้น 2',
    '3': 'ชั้น 3',
  };
  
  return classNames[classId] || classId;
}

/**
 * คำนวณเวลาเดินทาง (duration) จากเวลาออกและเวลาถึง
 */
export function calculateDuration(departureTime: string, arrivalTime: string): string {
  try {
    // Parse times
    const [depHour, depMin] = departureTime.split(':').map(Number);
    const [arrHour, arrMin] = arrivalTime.split(':').map(Number);
    
    let totalMinutes = (arrHour * 60 + arrMin) - (depHour * 60 + depMin);
    
    // Handle overnight trains (negative duration means next day)
    if (totalMinutes < 0) {
      totalMinutes += 24 * 60; // Add 24 hours
    }
    
    return formatDuration(totalMinutes);
  } catch {
    return 'N/A';
  }
}

/**
 * สร้าง ID สั้นจาก GUID
 */
export function shortenId(guid: string): string {
  // ใช้ 8 ตัวอักษรแรกของ GUID
  return guid.split('-')[0].toUpperCase();
}

/**
 * Format ราคาเป็น Thai Baht
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

/**
 * Format วันที่เป็น Thai format
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  }).format(d);
}
