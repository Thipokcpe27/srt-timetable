# 🚂 SRT Timetable - Thai Railway Timetable System

A modern, accessible web application for searching and comparing State Railway of Thailand (SRT) train schedules.

![Next.js](https://img.shields.io/badge/Next.js-15.5-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8)
![WCAG 2.2 AAA](https://img.shields.io/badge/Accessibility-WCAG%202.2%20AAA-green)

## ✨ Features

### Core Features
- 🔍 **Smart Search** - Search trains by origin, destination
- 🚆 **Train Comparison** - Compare up to 4 trains side-by-side
- 📱 **Fully Responsive** - Optimized for mobile, tablet, and desktop
- ♿ **WCAG 2.2 AAA Accessible** - Screen reader support, keyboard navigation
- 🎨 **Modern UI** - Beautiful glassmorphism design with smooth animations

### Recent Updates (Phase 1)
- ✅ **Toast Notifications** - Non-blocking notifications for user actions
- ✅ **Empty State Illustrations** - Beautiful animated empty states
- ✅ **Search History** - localStorage-based history (last 10 searches)
- ✅ **Advanced Sorting** - Sort by time, price, or duration
- ✅ **Filter System** - Filter by train type, price range, departure time

## 🚀 Getting Started

### Prerequisites
- Node.js 18.x or higher
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/srt-timetable.git
cd srt-timetable
```

2. Install dependencies
```bash
npm install
```

3. Run the development server
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📦 Build for Production

```bash
# Build the application
npm run build

# Start production server
npm start
```

## 🏗️ Tech Stack

- **Framework:** Next.js 15.5 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Forms:** React Hook Form + Zod
- **Date Utils:** date-fns
- **Accessibility:** @axe-core/react (development)

## 📂 Project Structure

```
timetable/
├── app/                      # Next.js App Router
│   ├── globals.css          # Global styles
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Home page
├── components/              # React components
│   ├── AccessibilityToolbar.tsx
│   ├── EmptyState.tsx       # Empty state illustrations
│   ├── SearchHistory.tsx    # Search history feature
│   ├── Toast.tsx            # Toast notifications
│   ├── TrainCard.tsx        # Train info card
│   ├── TrainComparison.tsx  # Train comparison modal
│   ├── TrainFilter.tsx      # Filter component
│   ├── TrainResults.tsx     # Search results with sorting
│   └── TrainSearch.tsx      # Search form
├── lib/                     # Utilities & data
│   ├── searchHistory.ts     # Search history service
│   ├── searchUtils.ts       # Search utilities
│   ├── trainData.ts         # Mock train data
│   └── types.ts             # TypeScript types
└── public/                  # Static assets

```

## 🎯 Roadmap

See [IMPROVEMENTS.md](IMPROVEMENTS.md) for detailed development roadmap.

### Phase 2 (Upcoming)
- [ ] Favorite Routes
- [ ] Custom Date Picker
- [ ] Dark Mode
- [ ] Multi-language Support (Thai/English/Chinese)

### Phase 3 (Future)
- [ ] API Integration
- [ ] Admin Panel
- [ ] Real-time Train Status
- [ ] Booking System

## ♿ Accessibility

This project follows **WCAG 2.2 AAA** guidelines:
- ✅ Keyboard navigation support
- ✅ Screen reader optimized
- ✅ High contrast ratios
- ✅ Focus indicators
- ✅ ARIA labels and landmarks
- ✅ Skip to content links

## 📊 Performance

- **Bundle Size:** 43.5 kB (gzipped)
- **First Load JS:** 145 kB
- **Build Time:** ~10s
- **Static Generation:** All pages pre-rendered

## 📄 Documentation

- [IMPROVEMENTS.md](IMPROVEMENTS.md) - Development roadmap
- [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) - Recent changes
- [ACCESSIBILITY_CHECKLIST.md](ACCESSIBILITY_CHECKLIST.md) - A11y guidelines
- [DEPLOYMENT_OPTIONS.md](DEPLOYMENT_OPTIONS.md) - Deployment guides

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- State Railway of Thailand (SRT)
- Next.js Team
- Tailwind CSS Team
- Lucide Icons

---

**Made with ❤️ for Thai Railway Travelers**
