# JSON Backend Implementation Guide

## Quick Start

Convert your existing data to JSON format in 3 steps:

### Step 1: Create Data Directory Structure

```bash
mkdir -p data/core data/equipment data/pricing data/operations data/metadata
```

**Directory Structure:**
```
data/
├── core/
│   ├── stations.json
│   ├── trains.json
│   ├── stops.json
│   └── users.json
├── equipment/
│   ├── bogies.json
│   └── trailers.json
├── pricing/
│   ├── train-fees.json
│   ├── sleeper-fees.json
│   ├── ac-fees.json
│   └── base-fares.json
└── operations/
    ├── bookings.json
    └── analytics.json
```

---

## Step 2: Convert Existing Data

### A. Convert Stations (EASY)

**Current:** `lib/trainData.ts`
```typescript
export const stations: Station[] = [
  { id: 'BKK', name: 'กรุงเทพ...', code: 'BKK', ... }
];
```

**New:** `data/core/stations.json`
```json
{
  "version": "1.0.0",
  "lastUpdated": "2025-01-08T12:00:00Z",
  "stations": [
    {
      "id": "BKK",
      "code": "BKK",
      "name": "กรุงเทพ (หัวลำโพง)",
      "city": "กรุงเทพมหานคร",
      "region": "กลาง",
      "isActive": true
    }
  ]
}
```

### B. Convert Trains (EASY)

**Current:** `lib/trainData.ts`
```typescript
export const trains: Train[] = [
  {
    id: 'T001',
    trainNumber: 'SP001',
    ...
  }
];
```

**New:** `data/core/trains.json`
```json
{
  "version": "1.0.0",
  "lastUpdated": "2025-01-08T12:00:00Z",
  "trains": [
    {
      "id": "T001",
      "trainNumber": "SP001",
      "trainName": "ด่วนพิเศษกรุงเทพ-เชียงใหม่",
      "trainType": "SPECIAL_EXPRESS",
      "originStationId": "BKK",
      "destinationStationId": "CNX",
      "isActive": true,
      "createdAt": "2025-01-01T00:00:00Z"
    }
  ]
}
```

---

## Step 3: Create Data Access Layer

### Create `lib/data/jsonDataSource.ts`

```typescript
import fs from 'fs/promises';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');

export class JsonDataSource {
  // Generic read function
  async readJSON<T>(category: string, filename: string): Promise<T> {
    const filePath = path.join(DATA_DIR, category, filename);
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  }

  // Generic write function
  async writeJSON<T>(category: string, filename: string, data: T): Promise<void> {
    const filePath = path.join(DATA_DIR, category, filename);
    const dir = path.dirname(filePath);
    
    // Ensure directory exists
    await fs.mkdir(dir, { recursive: true });
    
    // Write with pretty formatting
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
  }

  // Stations
  async getStations() {
    const data = await this.readJSON<any>('core', 'stations.json');
    return data.stations;
  }

  async saveStations(stations: any[]) {
    await this.writeJSON('core', 'stations.json', {
      version: '1.0.0',
      lastUpdated: new Date().toISOString(),
      stations
    });
  }

  // Trains
  async getTrains() {
    const data = await this.readJSON<any>('core', 'trains.json');
    return data.trains;
  }

  async saveTrain(train: any) {
    const data = await this.readJSON<any>('core', 'trains.json');
    const index = data.trains.findIndex((t: any) => t.id === train.id);
    
    if (index >= 0) {
      data.trains[index] = { ...train, updatedAt: new Date().toISOString() };
    } else {
      data.trains.push({ ...train, createdAt: new Date().toISOString() });
    }
    
    data.lastUpdated = new Date().toISOString();
    await this.writeJSON('core', 'trains.json', data);
  }

  async deleteTrain(trainId: string) {
    const data = await this.readJSON<any>('core', 'trains.json');
    data.trains = data.trains.filter((t: any) => t.id !== trainId);
    data.lastUpdated = new Date().toISOString();
    await this.writeJSON('core', 'trains.json', data);
  }

  // Pricing
  async getBaseFares() {
    const data = await this.readJSON<any>('pricing', 'base-fares.json');
    return data.baseFares;
  }

  async calculatePrice(originId: string, destId: string, classType: string) {
    // Get stations
    const stations = await this.getStations();
    const origin = stations.find((s: any) => s.id === originId);
    const dest = stations.find((s: any) => s.id === destId);
    
    // Calculate distance (you'll implement this)
    const distance = this.calculateDistance(origin, dest);
    
    // Get fare rate
    const fares = await this.getBaseFares();
    const fareRule = fares.find((f: any) => 
      distance >= f.kilometerStart && distance <= f.kilometerEnd
    );
    
    // Calculate price
    const ratePerKm = fareRule[`class${classType}Fare`];
    return distance * ratePerKm;
  }

  private calculateDistance(origin: any, dest: any): number {
    // Haversine formula or lookup table
    // For now, mock calculation
    return 100;
  }
}

export const dataSource = new JsonDataSource();
```

---

## Step 4: Use in API Routes

### Create `app/api/trains/route.ts`

```typescript
import { dataSource } from '@/lib/data/jsonDataSource';
import { NextResponse } from 'next/server';

// GET /api/trains
export async function GET(request: Request) {
  try {
    const trains = await dataSource.getTrains();
    return NextResponse.json({ success: true, trains });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch trains' },
      { status: 500 }
    );
  }
}

// POST /api/trains
export async function POST(request: Request) {
  try {
    const train = await request.json();
    await dataSource.saveTrain(train);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to save train' },
      { status: 500 }
    );
  }
}

// DELETE /api/trains/[id]
export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const trainId = url.pathname.split('/').pop();
    
    if (!trainId) {
      return NextResponse.json(
        { success: false, error: 'Train ID required' },
        { status: 400 }
      );
    }
    
    await dataSource.deleteTrain(trainId);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to delete train' },
      { status: 500 }
    );
  }
}
```

---

## Step 5: Build Admin Panel

### Create `app/admin/trains/page.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';

export default function AdminTrainsPage() {
  const [trains, setTrains] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrains();
  }, []);

  const fetchTrains = async () => {
    const res = await fetch('/api/trains');
    const data = await res.json();
    setTrains(data.trains);
    setLoading(false);
  };

  const handleDelete = async (trainId: string) => {
    if (!confirm('Delete this train?')) return;
    
    await fetch(`/api/trains/${trainId}`, { method: 'DELETE' });
    fetchTrains(); // Refresh list
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Train Management</h1>
      
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">Train Number</th>
            <th className="p-2 border">Name</th>
            <th className="p-2 border">Route</th>
            <th className="p-2 border">Status</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {trains.map((train: any) => (
            <tr key={train.id}>
              <td className="p-2 border">{train.trainNumber}</td>
              <td className="p-2 border">{train.trainName}</td>
              <td className="p-2 border">
                {train.originStationId} → {train.destinationStationId}
              </td>
              <td className="p-2 border">
                <span className={train.isActive ? 'text-green-600' : 'text-red-600'}>
                  {train.isActive ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td className="p-2 border">
                <button
                  onClick={() => handleDelete(train.id)}
                  className="px-3 py-1 bg-red-500 text-white rounded"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

---

## Step 6: Conversion Script

### Create `scripts/convertToJson.ts`

```typescript
import { stations, trains } from '../lib/trainData';
import fs from 'fs/promises';
import path from 'path';

async function convert() {
  const dataDir = path.join(process.cwd(), 'data');
  
  // Create directories
  await fs.mkdir(path.join(dataDir, 'core'), { recursive: true });
  
  // Convert stations
  const stationsData = {
    version: '1.0.0',
    lastUpdated: new Date().toISOString(),
    stations: stations.map(s => ({
      ...s,
      isActive: true,
      createdAt: '2025-01-01T00:00:00Z'
    }))
  };
  
  await fs.writeFile(
    path.join(dataDir, 'core', 'stations.json'),
    JSON.stringify(stationsData, null, 2)
  );
  
  // Convert trains
  const trainsData = {
    version: '1.0.0',
    lastUpdated: new Date().toISOString(),
    trains: trains.map(t => ({
      id: t.id,
      trainNumber: t.trainNumber,
      trainName: t.trainName,
      trainType: t.trainNumber.startsWith('SP') ? 'SPECIAL_EXPRESS' : 'EXPRESS',
      originStationId: t.origin,
      destinationStationId: t.destination,
      departureTime: t.departureTime,
      arrivalTime: t.arrivalTime,
      duration: t.duration,
      stopSchedules: t.stopSchedules || [],
      classes: t.classes,
      amenities: t.amenities.map(a => a.id),
      operatingDays: t.operatingDays,
      isActive: true,
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z'
    }))
  };
  
  await fs.writeFile(
    path.join(dataDir, 'core', 'trains.json'),
    JSON.stringify(trainsData, null, 2)
  );
  
  console.log('✅ Conversion complete!');
  console.log(`✅ Created: data/core/stations.json (${stations.length} stations)`);
  console.log(`✅ Created: data/core/trains.json (${trains.length} trains)`);
}

convert().catch(console.error);
```

**Run:**
```bash
npx ts-node scripts/convertToJson.ts
```

---

## Benefits You Get

### 1. **Immediate Development**
```
✅ No waiting for database access
✅ Start building admin panel NOW
✅ Test all features TODAY
```

### 2. **Easy Database Import**
```
✅ When you get database access:
✅ Export SQL → JSON (you mentioned you can do this)
✅ Replace JSON files
✅ Zero code changes!
```

### 3. **Version Control**
```bash
git add data/
git commit -m "Update train SP001 schedule"
git diff HEAD~1 data/trains.json
# See exactly what changed!
```

### 4. **Simple Backup**
```bash
# Backup
cp -r data/ backup/data-2025-01-08/

# Restore
cp -r backup/data-2025-01-08/ data/
```

---

## Migration Path to SQL Server

When database access is granted:

### Option A: Keep JSON as Backup

```typescript
// lib/data/hybridDataSource.ts
export class HybridDataSource {
  async saveTrain(train: Train) {
    // Save to both!
    await jsonSource.saveTrain(train);
    await sqlSource.saveTrain(train);
  }
}
```

### Option B: Full Migration

```typescript
// scripts/migrateToSql.ts
import { dataSource as jsonSource } from './jsonDataSource';
import { dataSource as sqlSource } from './sqlDataSource';

async function migrate() {
  const trains = await jsonSource.getTrains();
  
  for (const train of trains) {
    await sqlSource.saveTrain(train);
  }
  
  console.log('✅ Migration complete!');
}
```

---

## Next Steps

1. **Create data directory** (5 minutes)
2. **Run conversion script** (2 minutes)
3. **Test reading JSON files** (10 minutes)
4. **Build first admin page** (1 hour)
5. **Complete all 10 systems** (8 hours)

---

## Questions?

**Q: Can I edit JSON files manually?**  
A: Yes! Use VS Code, it has excellent JSON support.

**Q: What if JSON file gets corrupted?**  
A: Git has your back! `git checkout data/trains.json`

**Q: Can I use this in production?**  
A: Yes, for small-medium scale (< 10,000 records). Migrate to SQL for large scale.

**Q: How do I backup?**  
A: Git commits are backups. Also copy `data/` folder regularly.

**Q: Can I switch to SQL later?**  
A: Yes! Just change the data source implementation. Frontend code stays the same.

---

**Ready to start?** Run the conversion script and build your admin panel! 🚀
