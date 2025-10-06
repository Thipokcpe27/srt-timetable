# 📝 TODO - งานที่เหลือ

## ✅ ทำเสร็จแล้ว

### 1. Toast Notification System ✅
- ✅ สร้าง Toast Component (4 types)
- ✅ สร้าง ToastProvider
- ✅ แทนที่ alert() ทั้งหมด
- ✅ Animation slide-in-right
- ✅ Auto-dismiss

### 2. Performance Optimization (รอบแรก) ✅
- ✅ ลบ Lazy Loading
- ✅ ลด delay จาก 500ms → 100ms
- ✅ Optimize animations
- ✅ Optimize Next.js config

---

## 🚧 ยังไม่ทำ - ต้องทำให้เสร็จ

### 1. Advanced Filters (มีอยู่แล้ว แต่ต้องเพิ่ม)
**สิ่งที่ต้องเพิ่ม:**
```typescript
// ใน TrainFilter.tsx เพิ่ม:
- [ ] Sort by (ราคา ต่ำ-สูง, สูง-ต่ำ)
- [ ] Sort by (เวลาออกเดินทาง)
- [ ] Sort by (ระยะเวลาเดินทาง)
- [ ] กรอง Amenities (Wi-Fi, อาหาร, ปลั๊กไฟ, เครื่องปรับอากาศ)
```

**ไฟล์ที่ต้องแก้:**
- `components/TrainFilter.tsx` - เพิ่ม sort options และ amenities filter
- `components/TrainResults.tsx` - รองรับ sort

---

### 2. Favorite Routes System
**สิ่งที่ต้องทำ:**
```typescript
// สร้างไฟล์ใหม่:
- [ ] hooks/useFavorites.ts - Custom hook สำหรับจัดการ favorites (localStorage)
- [ ] components/FavoriteButton.tsx - ปุ่มดาวสำหรับบันทึก
- [ ] components/FavoritesList.tsx - แสดงรายการโปรด

// แก้ไฟล์เดิม:
- [ ] app/page.tsx - เพิ่ม favorites section
- [ ] components/TrainSearch.tsx - เพิ่มปุ่มโหลดจาก favorites
```

**ฟีเจอร์:**
- บันทึกเส้นทางโปรด (สถานีต้นทาง-ปลายทาง)
- Quick search จากรายการโปรด
- ลบรายการโปรดได้
- เก็บใน localStorage

---

### 3. Empty State Illustrations
**สิ่งที่ต้องทำ:**
```typescript
// สร้างไฟล์ใหม่:
- [ ] components/EmptyState.tsx - Component สำหรับ empty states
- [ ] public/illustrations/ - โฟลเดอร์เก็บ SVG

// แก้ไฟล์เดิม:
- [ ] components/TrainResults.tsx - ใช้ EmptyState แทน text
- [ ] app/page.tsx - แสดง EmptyState เมื่อยังไม่ได้ค้นหา
```

**ใช้ SVG illustrations สำหรับ:**
- ยังไม่ได้ค้นหา
- ไม่พบผลลัพธ์
- Error / Network issue

---

### 4. Dark Mode
**สิ่งที่ต้องทำ:**
```bash
npm install next-themes
```

```typescript
// สร้างไฟล์ใหม่:
- [ ] components/ThemeProvider.tsx
- [ ] components/ThemeToggle.tsx

// แก้ไฟล์เดิม:
- [ ] app/layout.tsx - ใส่ ThemeProvider
- [ ] app/globals.css - เพิ่ม dark mode styles
- [ ] app/page.tsx - เพิ่ม ThemeToggle ใน header

// เพิ่ม dark: variants ทุกไฟล์:
- [ ] components/TrainCard.tsx
- [ ] components/TrainResults.tsx
- [ ] components/TrainSearch.tsx
- [ ] components/AccessibilityToolbar.tsx
```

**Classes:**
```css
/* เพิ่มใน globals.css */
.dark {
  /* Dark mode styles */
}
```

---

### 5. Date Picker Calendar
**สิ่งที่ต้องทำ:**
```bash
npm install react-day-picker date-fns
```

```typescript
// สร้างไฟล์ใหม่:
- [ ] components/DatePicker.tsx - Custom calendar
- [ ] components/Calendar.tsx - Calendar UI

// แก้ไฟล์เดิม:
- [ ] components/TrainSearch.tsx - แทนที่ native date input
```

**ฟีเจอร์:**
- แสดง calendar popup
- Disable วันที่ผ่านไป
- Keyboard accessible
- Mobile friendly

---

### 6. Multi-language Support (i18n)
**สิ่งที่ต้องทำ:**
```bash
npm install next-intl
```

```typescript
// สร้างไฟล์ใหม่:
- [ ] messages/th.json - ภาษาไทย
- [ ] messages/en.json - ภาษาอังกฤษ
- [ ] components/LanguageSwitcher.tsx
- [ ] middleware.ts - Locale detection

// แก้ไฟล์เดิม:
- [ ] next.config.ts - เพิ่ม i18n config
- [ ] app/layout.tsx - ใส่ IntlProvider
- [ ] แปลงข้อความทั้งหมดเป็น useTranslations()
```

**ภาษาที่รองรับ:**
- ไทย (default)
- English

---

### 7. PWA Configuration
**สิ่งที่ต้องทำ:**
```bash
npm install next-pwa @ducanh2912/next-pwa
```

```typescript
// สร้างไฟล์ใหม่:
- [ ] public/manifest.json
- [ ] public/icons/ - PWA icons (192x192, 512x512)
- [ ] public/sw.js - Service Worker
- [ ] app/offline/page.tsx - Offline page

// แก้ไฟล์เดิม:
- [ ] next.config.ts - เพิ่ม PWA config
- [ ] app/layout.tsx - เพิ่ม manifest link
```

**ฟีเจอร์:**
- Install app on mobile
- Offline support
- Cache static assets
- Background sync

---

### 8. Train Route Map
**สิ่งที่ต้องทำ:**
```bash
npm install leaflet react-leaflet
npm install -D @types/leaflet
```

```typescript
// สร้างไฟล์ใหม่:
- [ ] components/RouteMap.tsx - แผนที่
- [ ] components/MapMarker.tsx - Marker สถานี

// แก้ไฟล์เดิม:
- [ ] components/TrainCard.tsx - เพิ่มแท็บ "แผนที่"
- [ ] lib/trainData.ts - เพิ่ม coordinates ให้ stations
```

**ฟีเจอร์:**
- แสดงเส้นทาง
- แสดงจุดจอดทั้งหมด
- คำนวณระยะทาง
- Zoom in/out

---

### 9. Performance Optimization (รอบสุดท้าย)
**เป้าหมาย:** Lighthouse Performance > 90

**สิ่งที่ต้องทำ:**
```typescript
// 1. Code Splitting
- [ ] Dynamic imports สำหรับ components ใหญ่
- [ ] Route-based splitting

// 2. Image Optimization
- [ ] ใช้ next/image แทน <img>
- [ ] Lazy load images
- [ ] WebP format

// 3. Font Optimization
- [ ] Preload fonts
- [ ] font-display: swap
- [ ] Subset fonts

// 4. CSS Optimization
- [ ] Critical CSS inline
- [ ] Remove unused CSS
- [ ] Minify CSS

// 5. JavaScript Optimization
- [ ] Tree shaking
- [ ] Code minification
- [ ] Remove console.logs

// 6. Caching
- [ ] Set cache headers
- [ ] Service Worker caching
- [ ] API response caching

// 7. Bundle Analysis
npm install @next/bundle-analyzer
- [ ] Analyze bundle size
- [ ] ลด dependencies ที่ไม่จำเป็น
```

**เป้าหมาย Metrics:**
| Metric | Current | Target |
|--------|---------|--------|
| Performance | 66 | 90+ |
| FCP | 1.4s | <1s |
| LCP | 14.1s | <2.5s |
| TBT | 2,310ms | <300ms |
| CLS | 0.033 | <0.1 ✅ |

---

## 🎯 ลำดับการทำงานที่แนะนำ

### Phase 1: Quick Wins (2-3 ชั่วโมง)
1. ✅ Toast Notifications (เสร็จแล้ว)
2. ⏳ Advanced Filters - เพิ่ม sort และ amenities
3. ⏳ Empty State Illustrations
4. ⏳ Favorite Routes

### Phase 2: Medium Features (3-4 ชั่วโมง)
5. ⏳ Dark Mode
6. ⏳ Date Picker Calendar

### Phase 3: Complex Features (4-6 ชั่วโมง)
7. ⏳ Multi-language (i18n)
8. ⏳ PWA Configuration
9. ⏳ Train Route Map

### Phase 4: Performance (2-3 ชั่วโมง)
10. ⏳ Performance Optimization ให้ได้ > 90 คะแนน

---

## 📦 Dependencies ที่ต้องติดตั้ง

```bash
# Dark Mode
npm install next-themes

# Date Picker
npm install react-day-picker date-fns

# i18n
npm install next-intl

# PWA
npm install @ducanh2912/next-pwa

# Maps
npm install leaflet react-leaflet
npm install -D @types/leaflet

# Bundle Analysis
npm install @next/bundle-analyzer
```

---

## 🚀 วิธีทำต่อ

### ให้ Claude ทำต่อ:
เพียงบอก: **"ทำ [feature name] ต่อ"**

ตัวอย่าง:
- "ทำ Advanced Filters ต่อ"
- "ทำ Dark Mode ต่อ"
- "ทำ Favorite Routes ต่อ"

หรือบอก: **"ทำให้ครบทั้งหมด"** - Claude จะทำทีละ feature จนครบ

---

## 📝 หมายเหตุ

- งานทั้งหมดนี้ **ไม่รวม Backend** (รอ Database Schema)
- **Performance** ทำสุดท้ายเพื่อไม่ให้ฟีเจอร์ใหม่ทำให้คะแนนตกอีก
- แต่ละ feature มี **Accessibility (WCAG 2.2 AAA)** ครบถ้วน
- ใช้ **TypeScript** และ **Tailwind CSS** ทั้งหมด

---

**สถานะปัจจุบัน:** 1/10 features เสร็จ (10%)
**เป้าหมาย:** ทำให้ครบ 10/10 features (100%)
