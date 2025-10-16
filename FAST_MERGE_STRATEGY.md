# Fast Data Merge Strategy

## The Problem

You have:
1. ❌ **Old database** (can't access yet, unknown schema)
2. ✅ **New database design** (modern, clean schema)
3. 🎯 **Need to merge them quickly** when old DB becomes available

---

## The Solution: 3-Phase Approach

```
Phase 1: NOW (No old DB access needed)
├── Design new schema ✅
├── Create SQL Server database
├── Insert sample/mock data
├── Build frontend + admin panel
└── Deploy and test
Timeline: 2-3 days

Phase 2: BRIDGE (When old DB access granted)
├── Export old DB → JSON files
├── Analyze old schema structure
├── Create field mapping document
├── Transform JSON to match new schema
└── Import to new database
Timeline: 4-8 hours

Phase 3: MERGE (Combine data)
├── Identify duplicate records
├── Merge logic (keep old or new?)
├── Validate data integrity
└── Go live with merged data
Timeline: 2-4 hours
```

**Total Time**: 3-4 days (mostly Phase 1 without waiting!)

---

## Phase 1: Build NEW System NOW (No Waiting!)

### 1A. Create New Database (30 minutes)

```sql
-- Run the schema from NEW_DATABASE_DESIGN.md
-- Copy all CREATE TABLE statements
-- Run in SQL Server Management Studio (SSMS)
```

### 1B. Insert Sample Data (1 hour)

Use your existing `trainData.ts` to populate new database:

```typescript
// scripts/seedNewDatabase.ts
import { trains, stations } from '../lib/trainData';
import { getConnection, sql } from '../lib/db/sqlServer';

async function seedStations() {
  const pool = await getConnection();
  
  for (const station of stations) {
    await pool.request()
      .input('StationId', sql.VarChar(50), station.id)
      .input('StationCode', sql.VarChar(10), station.code)
      .input('NameTH', sql.NVarChar(200), station.name)
      .input('City', sql.NVarChar(100), station.city)
      .input('Region', sql.NVarChar(100), station.region)
      .query(`
        INSERT INTO Stations 
        (StationId, StationCode, NameTH, City, Region, IsActive) 
        VALUES 
        (@StationId, @StationCode, @NameTH, @City, @Region, 1)
      `);
  }
  
  console.log(`✅ Inserted ${stations.length} stations`);
}

async function seedTrains() {
  const pool = await getConnection();
  
  for (const train of trains) {
    // Determine train type
    const trainTypeId = train.trainNumber.startsWith('SP') ? 'TT001' : 'TT002';
    
    await pool.request()
      .input('TrainId', sql.VarChar(50), train.id)
      .input('TrainNumber', sql.VarChar(20), train.trainNumber)
      .input('TrainName', sql.NVarChar(200), train.trainName)
      .input('TrainTypeId', sql.VarChar(50), trainTypeId)
      .input('OriginStationId', sql.VarChar(50), train.origin)
      .input('DestinationStationId', sql.VarChar(50), train.destination)
      .input('DepartureTime', sql.Time, train.departureTime)
      .input('ArrivalTime', sql.Time, train.arrivalTime)
      .query(`
        INSERT INTO Trains 
        (TrainId, TrainNumber, TrainName, TrainTypeId, 
         OriginStationId, DestinationStationId, 
         DepartureTime, ArrivalTime, IsActive) 
        VALUES 
        (@TrainId, @TrainNumber, @TrainName, @TrainTypeId,
         @OriginStationId, @DestinationStationId,
         @DepartureTime, @ArrivalTime, 1)
      `);
    
    // Insert stop schedules
    if (train.stopSchedules) {
      for (const stop of train.stopSchedules) {
        const sequence = train.stopSchedules.indexOf(stop) + 1;
        
        await pool.request()
          .input('TrainId', sql.VarChar(50), train.id)
          .input('StationId', sql.VarChar(50), stop.stationId)
          .input('Sequence', sql.Int, sequence)
          .input('ArrivalTime', sql.Time, stop.arrivalTime)
          .input('DepartureTime', sql.Time, stop.departureTime)
          .query(`
            INSERT INTO TrainSchedules 
            (TrainId, StationId, SequenceNumber, ArrivalTime, DepartureTime) 
            VALUES 
            (@TrainId, @StationId, @Sequence, @ArrivalTime, @DepartureTime)
          `);
      }
    }
  }
  
  console.log(`✅ Inserted ${trains.length} trains`);
}

async function seed() {
  try {
    console.log('🌱 Seeding database...');
    await seedStations();
    await seedTrains();
    console.log('✅ Database seeded successfully!');
  } catch (error) {
    console.error('❌ Seed failed:', error);
  }
}

seed();
```

**Run:**
```bash
npm install mssql
npx ts-node scripts/seedNewDatabase.ts
```

### 1C. Build Admin Panel (4-6 hours)

Now you have a working database! Build your admin panel to manage it.

---

## Phase 2: When Old DB Access Granted (FAST!)

### 2A. Export Old Database to JSON (1 hour)

```sql
-- Run in OLD database

-- Export all tables
DECLARE @tables TABLE (name VARCHAR(100));
INSERT INTO @tables VALUES 
('Stations'), ('Trains'), ('Schedules'), ('Passengers'), ('Bookings');

-- For each table, run:
SELECT * FROM [TableName] FOR JSON PATH, ROOT('data');

-- Save each result to JSON file:
-- old-data/stations.json
-- old-data/trains.json
-- etc.
```

Or use a tool like **Azure Data Studio** or **SSMS**:
1. Right-click table → "Select Top 1000 Rows"
2. Results → Export → Save as JSON

### 2B. Analyze Old Schema (30 minutes)

Create `old-data/schema-mapping.json`:

```json
{
  "stations": {
    "oldTable": "tbl_stations",
    "mapping": {
      "sta_id": "StationId",
      "sta_code": "StationCode",
      "sta_name_th": "NameTH",
      "sta_name_en": "NameEN",
      "sta_city": "City",
      "sta_region": "Region",
      "sta_lat": "Latitude",
      "sta_lng": "Longitude",
      "sta_active": "IsActive"
    }
  },
  "trains": {
    "oldTable": "tbl_trains",
    "mapping": {
      "trn_id": "TrainId",
      "trn_number": "TrainNumber",
      "trn_name": "TrainName",
      "trn_type": "TrainTypeId",
      "origin_sta_id": "OriginStationId",
      "dest_sta_id": "DestinationStationId",
      "dept_time": "DepartureTime",
      "arr_time": "ArrivalTime",
      "is_active": "IsActive"
    }
  }
}
```

### 2C. Transform Old Data (2-3 hours)

Create `scripts/transformOldData.ts`:

```typescript
import fs from 'fs/promises';
import path from 'path';

// Load schema mapping
const schemaMapping = require('../old-data/schema-mapping.json');

// Transform functions
function transformStation(oldStation: any): any {
  const mapping = schemaMapping.stations.mapping;
  
  return {
    StationId: oldStation[mapping.sta_id] || generateId(),
    StationCode: oldStation[mapping.sta_code],
    NameTH: oldStation[mapping.sta_name_th],
    NameEN: oldStation[mapping.sta_name_en] || null,
    City: oldStation[mapping.sta_city],
    Region: oldStation[mapping.sta_region],
    Latitude: oldStation[mapping.sta_lat],
    Longitude: oldStation[mapping.sta_lng],
    IsActive: oldStation[mapping.sta_active] === 1 ? true : false,
    CreatedAt: oldStation.created_at || new Date().toISOString(),
    _source: 'OLD_DB' // Mark as imported
  };
}

function transformTrain(oldTrain: any): any {
  const mapping = schemaMapping.trains.mapping;
  
  return {
    TrainId: oldTrain[mapping.trn_id] || generateId(),
    TrainNumber: oldTrain[mapping.trn_number],
    TrainName: oldTrain[mapping.trn_name],
    TrainTypeId: mapTrainType(oldTrain[mapping.trn_type]),
    OriginStationId: oldTrain[mapping.origin_sta_id],
    DestinationStationId: oldTrain[mapping.dest_sta_id],
    DepartureTime: oldTrain[mapping.dept_time],
    ArrivalTime: oldTrain[mapping.arr_time],
    IsActive: oldTrain[mapping.is_active] === 1 ? true : false,
    CreatedAt: oldTrain.created_at || new Date().toISOString(),
    _source: 'OLD_DB'
  };
}

// Helper: Map old train type codes to new IDs
function mapTrainType(oldType: string): string {
  const typeMap: Record<string, string> = {
    'SP': 'TT001', // Special Express
    'EX': 'TT002', // Express
    'RP': 'TT003', // Rapid
    'OR': 'TT004', // Ordinary
    'LX': 'TT005'  // Luxury
  };
  
  return typeMap[oldType] || 'TT002'; // Default to Express
}

// Main transform function
async function transform() {
  console.log('🔄 Transforming old data...');
  
  // Read old data
  const oldStations = JSON.parse(
    await fs.readFile('old-data/stations.json', 'utf-8')
  );
  const oldTrains = JSON.parse(
    await fs.readFile('old-data/trains.json', 'utf-8')
  );
  
  // Transform
  const newStations = oldStations.data.map(transformStation);
  const newTrains = oldTrains.data.map(transformTrain);
  
  // Save transformed data
  await fs.writeFile(
    'old-data/transformed-stations.json',
    JSON.stringify(newStations, null, 2)
  );
  await fs.writeFile(
    'old-data/transformed-trains.json',
    JSON.stringify(newTrains, null, 2)
  );
  
  console.log(`✅ Transformed ${newStations.length} stations`);
  console.log(`✅ Transformed ${newTrains.length} trains`);
  console.log('📁 Saved to old-data/transformed-*.json');
}

function generateId(): string {
  return 'ID' + Date.now() + Math.random().toString(36).substr(2, 9);
}

transform().catch(console.error);
```

**Run:**
```bash
npx ts-node scripts/transformOldData.ts
```

---

## Phase 3: Merge Old + New Data (SMART!)

### 3A. Identify Duplicates (1 hour)

```typescript
// scripts/findDuplicates.ts
import { getConnection, sql } from '../lib/db/sqlServer';
import fs from 'fs/promises';

async function findDuplicates() {
  const pool = await getConnection();
  
  // Load transformed old data
  const oldStations = JSON.parse(
    await fs.readFile('old-data/transformed-stations.json', 'utf-8')
  );
  
  // Get existing stations from new DB
  const result = await pool.request().query('SELECT * FROM Stations');
  const newStations = result.recordset;
  
  // Find duplicates by StationCode
  const duplicates = [];
  
  for (const oldSta of oldStations) {
    const existing = newStations.find(
      n => n.StationCode === oldSta.StationCode
    );
    
    if (existing) {
      duplicates.push({
        code: oldSta.StationCode,
        old: oldSta,
        new: existing,
        action: 'MERGE' // or 'SKIP_OLD', 'REPLACE_NEW'
      });
    }
  }
  
  // Save report
  await fs.writeFile(
    'merge-report.json',
    JSON.stringify(duplicates, null, 2)
  );
  
  console.log(`Found ${duplicates.length} duplicates`);
  console.log('Review merge-report.json to decide merge strategy');
}

findDuplicates().catch(console.error);
```

### 3B. Choose Merge Strategy

**Option 1: Keep NEW, Add Missing from OLD**
```typescript
// Only import records that don't exist in new DB
// Safest option - preserves your work
```

**Option 2: Keep OLD, Update with NEW**
```typescript
// Import all old records, mark new records as _new
// Good if old DB has more complete data
```

**Option 3: SMART MERGE**
```typescript
// Compare field by field, choose best data
// Example: Keep old CreatedAt, use new Coordinates
```

### 3C. Execute Merge (1-2 hours)

```typescript
// scripts/mergeData.ts
import { getConnection, sql } from '../lib/db/sqlServer';
import fs from 'fs/promises';

async function mergeStations(strategy: 'KEEP_NEW' | 'KEEP_OLD' | 'SMART') {
  const pool = await getConnection();
  const oldStations = JSON.parse(
    await fs.readFile('old-data/transformed-stations.json', 'utf-8')
  );
  
  for (const oldSta of oldStations) {
    // Check if exists
    const existing = await pool.request()
      .input('Code', sql.VarChar(10), oldSta.StationCode)
      .query('SELECT * FROM Stations WHERE StationCode = @Code');
    
    if (existing.recordset.length === 0) {
      // NEW record - insert
      await insertStation(pool, oldSta);
      console.log(`✅ Inserted new station: ${oldSta.StationCode}`);
    } else {
      // DUPLICATE - apply strategy
      const newSta = existing.recordset[0];
      
      switch (strategy) {
        case 'KEEP_NEW':
          console.log(`⏭️  Skipped duplicate: ${oldSta.StationCode}`);
          break;
          
        case 'KEEP_OLD':
          await updateStation(pool, oldSta);
          console.log(`🔄 Updated with old data: ${oldSta.StationCode}`);
          break;
          
        case 'SMART':
          const merged = smartMerge(oldSta, newSta);
          await updateStation(pool, merged);
          console.log(`🧠 Smart merged: ${oldSta.StationCode}`);
          break;
      }
    }
  }
}

function smartMerge(oldData: any, newData: any): any {
  return {
    ...newData, // Start with new data
    // Override with old data if better
    CreatedAt: oldData.CreatedAt || newData.CreatedAt, // Keep original date
    Latitude: oldData.Latitude || newData.Latitude, // Use old if exists
    Longitude: oldData.Longitude || newData.Longitude,
    // Keep new descriptions (you wrote them!)
    NameEN: newData.NameEN || oldData.NameEN,
  };
}

async function insertStation(pool: any, station: any) {
  await pool.request()
    .input('StationId', sql.VarChar(50), station.StationId)
    .input('StationCode', sql.VarChar(10), station.StationCode)
    .input('NameTH', sql.NVarChar(200), station.NameTH)
    .input('NameEN', sql.VarChar(200), station.NameEN)
    .input('City', sql.NVarChar(100), station.City)
    .input('Region', sql.NVarChar(100), station.Region)
    .input('Latitude', sql.Decimal(10, 7), station.Latitude)
    .input('Longitude', sql.Decimal(10, 7), station.Longitude)
    .input('IsActive', sql.Bit, station.IsActive ? 1 : 0)
    .query(`
      INSERT INTO Stations 
      (StationId, StationCode, NameTH, NameEN, City, Region, 
       Latitude, Longitude, IsActive)
      VALUES 
      (@StationId, @StationCode, @NameTH, @NameEN, @City, @Region,
       @Latitude, @Longitude, @IsActive)
    `);
}

async function merge() {
  console.log('🔀 Merging data...');
  console.log('Strategy: SMART (best of both)');
  
  await mergeStations('SMART');
  await mergeTrains('SMART');
  await mergeSchedules('KEEP_OLD'); // Old schedules = historical data
  
  console.log('✅ Merge complete!');
}

merge().catch(console.error);
```

**Run:**
```bash
npx ts-node scripts/mergeData.ts
```

---

## Timeline Summary

| Phase | What | Time | Can Start |
|-------|------|------|-----------|
| **1** | Design new DB | 1 hour | ✅ NOW |
| **1** | Create schema | 30 min | ✅ NOW |
| **1** | Seed sample data | 1 hour | ✅ NOW |
| **1** | Build admin panel | 6 hours | ✅ NOW |
| **1** | Deploy & test | 2 hours | ✅ NOW |
| **2** | Export old DB | 1 hour | ⏳ When access granted |
| **2** | Transform data | 3 hours | ⏳ After export |
| **3** | Find duplicates | 1 hour | ⏳ After transform |
| **3** | Merge data | 2 hours | ⏳ After analysis |
| **TOTAL** | **17 hours** | **2-3 days** | **10 hours can start NOW!** |

---

## Recommended Merge Strategy

```
For your situation, use SMART MERGE:

Stations:
├── Keep NEW coordinates (you added them)
├── Keep OLD CreatedAt (historical date)
└── Merge descriptions (best from both)

Trains:
├── Keep NEW schedules (you fixed them)
├── Keep OLD booking history (important!)
└── Keep NEW amenities (you added them)

Pricing:
├── Use NEW pricing tables (modern structure)
└── Archive OLD prices for reference

Bookings:
├── Import ALL old bookings (customer data!)
└── Link to new train IDs
```

---

## Validation Checklist

After merge, run these checks:

```sql
-- 1. Check for orphaned records
SELECT * FROM Trains 
WHERE OriginStationId NOT IN (SELECT StationId FROM Stations);

-- 2. Check duplicate station codes
SELECT StationCode, COUNT(*) 
FROM Stations 
GROUP BY StationCode 
HAVING COUNT(*) > 1;

-- 3. Check data completeness
SELECT 
  (SELECT COUNT(*) FROM Stations) as Stations,
  (SELECT COUNT(*) FROM Trains) as Trains,
  (SELECT COUNT(*) FROM TrainSchedules) as Schedules,
  (SELECT COUNT(*) FROM Bookings) as Bookings;

-- 4. Check foreign key integrity
EXEC sp_MSforeachtable @command1='DBCC CHECKCONSTRAINTS(''?'')';
```

---

## Rollback Plan

If merge fails:

```sql
-- Restore from backup
RESTORE DATABASE RailwayManagement 
FROM DISK = 'backup/before-merge.bak'
WITH REPLACE;

-- Or: Delete imported records
DELETE FROM Stations WHERE _source = 'OLD_DB';
DELETE FROM Trains WHERE _source = 'OLD_DB';
```

---

## Best Practices

### DO ✅
1. **Backup before merge** - SQL Server backup
2. **Test on copy first** - Create test database
3. **Document field mappings** - Save schema-mapping.json
4. **Validate after merge** - Run checks
5. **Keep old data** - Archive JSON files

### DON'T ❌
1. **Delete old DB immediately** - Keep for reference
2. **Merge without analysis** - Review duplicates first
3. **Skip validation** - Always check integrity
4. **Forget timestamps** - Preserve CreatedAt dates
5. **Ignore audit logs** - Track what was merged

---

## Summary

**Your Fast Path:**

1. **TODAY**: Create new database + seed with current data (2 hours)
2. **THIS WEEK**: Build admin panel + deploy (8 hours)
3. **WHEN OLD DB READY**: Export → Transform → Merge (6 hours)

**Total**: ~16 hours work, spread over days/weeks based on DB access

**Advantage**: You're NOT blocked! Work continues with new schema immediately.

---

**Next Action**: Run the schema creation script from `NEW_DATABASE_DESIGN.md` now! 🚀
