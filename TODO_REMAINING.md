# Remaining Tasks

## ✅ Completed (Just Now)

1. **Arrival/Departure Times for Stops**
   - ✅ Updated `lib/types.ts` with `StopSchedule` interface
   - ✅ Added `stopSchedules` to Train interface
   - ✅ Updated `lib/trainData.ts` for T001 train with times
   - ✅ Modified `components/TrainCard.tsx` to display arrival/departure times
   - **Example:** Phra Nakhon Si Ayutthaya (AYA) - ถึง: 09:30, ออก: 09:35

2. **Popular Routes Component Created**
   - ✅ Built `components/PopularRoutes.tsx`
   - ✅ Real-time updates (every 5 seconds)
   - ✅ Shows top 4 most searched routes
   - ✅ Trend indicators (📈 up, 📉 down, ➡️ stable)
   - ✅ Search counts with live indicator
   - ✅ Clickable to auto-fill search form

3. **WCAG 2.2 AAA Accessibility Documentation**
   - ✅ Created `ACCESSIBILITY_CHECKLIST.md`
   - ✅ Complete Level A, AA, AAA criteria breakdown
   - ✅ Screen reader testing guide
   - ✅ Recommended enhancements
   - ✅ Implementation priority phases

---

## 📋 Next Steps (To Complete Your Requests)

### 1. Integrate PopularRoutes Component into Homepage

**Recommended Placement: Below Search Form**

Edit `app/page.tsx`:

```tsx
import PopularRoutes from '@/components/PopularRoutes';

export default function Home() {
  // ... existing code ...
  
  const handlePopularRouteClick = (from: string, to: string) => {
    // Auto-fill search form
    setSearchParams({ origin: from, destination: to });
    // Optionally trigger search immediately
    handleSearch({ origin: from, destination: to });
  };

  return (
    <main>
      {/* Existing search form */}
      <TrainSearch onSearch={handleSearch} />
      
      {/* ADD THIS: Popular Routes Section */}
      {!results && (
        <div className="mt-8">
          <PopularRoutes onRouteClick={handlePopularRouteClick} />
        </div>
      )}
      
      {/* Existing results */}
      {results && <TrainResults results={results} />}
    </main>
  );
}
```

**Alternative Placements:**
- **Option A:** Below search, above results (shown above) ⭐ **RECOMMENDED**
- **Option B:** Sidebar (desktop only)
- **Option C:** Fixed bottom banner (mobile)
- **Option D:** Above search form (less prominent)

---

### 2. Add Arrival/Departure Times to All Trains

Currently only T001 has `stopSchedules`. Update remaining trains in `lib/trainData.ts`:

```typescript
// T002 - Bangkok to Hat Yai
{
  id: 'T002',
  // ... existing fields ...
  stopSchedules: [
    { stationId: 'BKK', arrivalTime: null, departureTime: '14:45' },
    { stationId: 'SRT', arrivalTime: '19:30', departureTime: '19:40' },
    { stationId: 'HYI', arrivalTime: '05:30', departureTime: null },
  ],
}

// T003 - Bangkok to Ubon Ratchathani
{
  id: 'T003',
  // ... existing fields ...
  stopSchedules: [
    { stationId: 'BKK', arrivalTime: null, departureTime: '20:30' },
    { stationId: 'NMA', arrivalTime: '23:45', departureTime: '23:50' },
    { stationId: 'KKN', arrivalTime: '03:15', departureTime: '03:20' },
    { stationId: 'UBN', arrivalTime: '06:00', departureTime: null },
  ],
}

// Continue for all trains...
```

---

### 3. Implement Accessibility Enhancements

Based on `ACCESSIBILITY_CHECKLIST.md`, priority enhancements:

#### Phase 1: Critical (High Priority)

1. **Enhanced Color Contrast (AAA: 7:1)**
   ```css
   /* tailwind.config.ts - update colors */
   colors: {
     gray: {
       600: '#3a4556', // Darker for 7:1 contrast
       700: '#2d3748',
     }
   }
   ```

2. **Screen Reader Live Regions**
   ```tsx
   // Add to TrainResults.tsx
   <div aria-live="polite" aria-atomic="true" className="sr-only">
     พบรถไฟ {trains.length} ขบวน สำหรับเส้นทาง {origin} ถึง {destination}
   </div>
   ```

3. **Reduced Motion Support**
   ```css
   /* globals.css */
   @media (prefers-reduced-motion: reduce) {
     *, *::before, *::after {
       animation-duration: 0.01ms !important;
       animation-iteration-count: 1 !important;
       transition-duration: 0.01ms !important;
     }
   }
   ```

#### Phase 2: Important (Medium Priority)

4. **Keyboard Shortcuts**
   ```tsx
   // Add to app/page.tsx
   useEffect(() => {
     const handleKeyboard = (e: KeyboardEvent) => {
       if (e.altKey && e.key === 's') {
         searchFormRef.current?.focus();
       }
       if (e.key === 'Escape') {
         closeAllModals();
       }
     };
     window.addEventListener('keydown', handleKeyboard);
     return () => window.removeEventListener('keydown', handleKeyboard);
   }, []);
   ```

5. **Enhanced Focus Indicators**
   ```css
   /* globals.css */
   :focus-visible {
     outline: 3px solid #3b82f6;
     outline-offset: 2px;
     border-radius: 4px;
     box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
   }
   ```

---

## 📊 Visual Guide: PopularRoutes Placement

```
┌─────────────────────────────────────────┐
│  HEADER / NAVIGATION                    │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  🔍 SEARCH FORM                         │
│  [Origin] → [Destination] [Search]      │
└─────────────────────────────────────────┘

         ⬇️ IF NO RESULTS YET ⬇️

┌─────────────────────────────────────────┐
│  📈 เส้นทางยอดนิยม (POPULAR ROUTES)      │
│  ┌───────────────────────────────────┐  │
│  │ 1. กรุงเทพ → เชียงใหม่  📈  1,847 │  │
│  │    11ชม. 45นาที • ฿650-1,850     │  │
│  ├───────────────────────────────────┤  │
│  │ 2. กรุงเทพ → หาดใหญ่   📈  1,523 │  │
│  │    14ชม. 45นาที • ฿750-2,150     │  │
│  ├───────────────────────────────────┤  │
│  │ 3. กรุงเทพ → อุบลราชธานี ➡️  892 │  │
│  │    9ชม. 30นาที • ฿450-1,200      │  │
│  └───────────────────────────────────┘  │
│  💡 ข้อมูลอัพเดททุก 5 วินาที • LIVE   │
└─────────────────────────────────────────┘

         ⬇️ OR IF RESULTS EXIST ⬇️

┌─────────────────────────────────────────┐
│  🚂 TRAIN RESULTS                        │
│  ┌─────────────────────────────────┐    │
│  │ ด่วนพิเศษกรุงเทพ-เชียงใหม่        │    │
│  │ 08:30 → 20:15 (11ชม. 45นาที)     │    │
│  │ [ดูรายละเอียด] ▼                 │    │
│  │                                   │    │
│  │ ตารางเวลา:                        │    │
│  │ • กรุงเทพ          ออก: 08:30    │    │
│  │ • พระนครศรีอยุธยา  ถึง: 09:30     │    │
│  │                   ออก: 09:35    │    │ ⬅️ NEW!
│  │ • ลำปาง           ถึง: 17:45     │    │
│  │                   ออก: 17:50    │    │
│  │ • เชียงใหม่         ถึง: 20:15    │    │
│  └─────────────────────────────────┘    │
└─────────────────────────────────────────┘
```

---

## 🎯 Quick Implementation Guide

### Step 1: Add Popular Routes to Homepage (5 minutes)

1. Open `app/page.tsx`
2. Import PopularRoutes component
3. Add click handler
4. Place component below search form
5. Test clicking routes auto-fills search

### Step 2: Complete Train Data (15 minutes)

1. Open `lib/trainData.ts`
2. Add `stopSchedules` to T002, T003, T004, etc.
3. Use realistic Thailand timezone times
4. Build and test

### Step 3: Basic Accessibility (10 minutes)

1. Add `prefers-reduced-motion` to `globals.css`
2. Add screen reader live region to TrainResults
3. Enhance focus styles in `globals.css`
4. Test with keyboard navigation

---

## 📝 Testing Checklist

### Arrival/Departure Times
- [ ] Expand train T001 details
- [ ] Click "ตารางเวลา" tab
- [ ] Verify intermediate stops show two times:
  - [ ] "ถึง: 09:30" (arrival)
  - [ ] "ออก: 09:35" (departure)
- [ ] Origin shows only departure time
- [ ] Destination shows only arrival time

### Popular Routes
- [ ] Visit homepage without searching
- [ ] See popular routes section
- [ ] Verify "LIVE" indicator is pulsing
- [ ] Click a route
- [ ] Confirm search form auto-fills
- [ ] Watch search counts increment (every 5s)

### Accessibility
- [ ] Navigate entire site using only Tab key
- [ ] Verify focus indicators visible
- [ ] Test with screen reader (NVDA/VoiceOver)
- [ ] Zoom to 200% - no loss of functionality
- [ ] Check color contrast with DevTools

---

## 🚀 Ready to Deploy

After completing above steps:

```bash
# Build to verify
npm run build

# Commit changes
git add .
git commit -m "Integrate popular routes and complete train schedules"

# Push to GitHub (triggers Vercel deployment)
git push origin main
```

---

## 📚 Reference Documents

- **Accessibility Guide:** `ACCESSIBILITY_CHECKLIST.md`
- **Component Code:** `components/PopularRoutes.tsx`
- **Type Definitions:** `lib/types.ts`
- **Train Data:** `lib/trainData.ts`

---

**Need Help?** Check the accessibility checklist for detailed implementation steps!
