# SRT Timetable - Deployment Options & Architecture

## 📋 สรุป Requirements
- ✅ ผู้ใช้ทั่วไป: เข้าได้โดยไม่ต้อง VPN (Public Internet)
- ✅ Admin: ต้อง VPN (Fortigate) + Authentication
- ✅ Database: SQL Server (GDCC)
- ✅ **Future: Sync ข้อมูลกับระบบอื่น (คนละเซิร์ฟเวอร์)**

---

## 🏗️ Option 1: Hybrid Deployment (แนะนำสำหรับ Scale + Security) ⭐

### Architecture Diagram
```
┌─────────────────────────────────────────────────────────────────┐
│                      Public Internet                             │
└──────────┬────────────────────────────────────────┬──────────────┘
           │                                        │
           │                                        │
┌──────────▼──────────┐                  ┌─────────▼────────────────┐
│  Frontend (CDN)     │                  │  API Server (VM GDCC)    │
│  Vercel/Netlify     │◄─────API Call────│  https://api.srt.com     │
│  Next.js (Static)   │                  │  Next.js API + Prisma    │
│                     │                  │  Public IP               │
│  - หน้าค้นหา        │                  │                          │
│  - แสดงผลลัพธ์      │                  │  API Routes:             │
│  - เปรียบเทียบ      │                  │  - /api/public/*         │
│  - Accessibility    │                  │  - /api/admin/*          │
└─────────────────────┘                  │  - /api/sync/* (ใหม่)   │
                                         └──────────┬───────────────┘
                                                    │
                              ┌─────────────────────┼──────────────────┐
                              │                     │                  │
                   ┌──────────▼──────────┐   ┌─────▼──────┐   ┌──────▼─────────┐
                   │ SQL Server (VM)     │   │ Admin Panel│   │ Sync Service   │
                   │ localhost:1433      │   │ VPN Only   │   │ Webhook/Queue  │
                   │ ไม่เปิดออก Internet │   │ /admin/*   │   │ /api/sync/*    │
                   └─────────────────────┘   └────────────┘   └────────────────┘
                                                                       │
                                                                       │
                                                           ┌───────────▼────────────┐
                                                           │  External System       │
                                                           │  (ระบบอื่น คนละ Server)│
                                                           │  - REST API            │
                                                           │  - Webhook             │
                                                           │  - Message Queue       │
                                                           └────────────────────────┘
```

### Components

#### 1. Frontend (CDN)
```yaml
Platform: Vercel / Netlify / Cloudflare Pages
Domain: https://srt-timetable.com
Access: Public (ไม่ต้อง VPN)
Build: Next.js Static Export
Features:
  - Server-Side Generation (SSG)
  - Client-Side Fetching (API Calls)
  - Fast Global CDN
  - Auto HTTPS
```

#### 2. API Server (VM GDCC)
```yaml
Platform: VM GDCC (Ubuntu 22.04 LTS)
Domain: https://api.srt-timetable.gdcc.com
Access:
  - Public API: เข้าได้โดยไม่ต้อง VPN
  - Admin API: ต้อง JWT Token (ได้จากการ Login ผ่าน VPN)
Runtime: Node.js 20 + PM2
Web Server: Nginx (Reverse Proxy)

API Routes:
  /api/public/trains       (GET) - ไม่ต้อง Auth
  /api/public/stations     (GET) - ไม่ต้อง Auth
  /api/public/search       (GET) - ไม่ต้อง Auth

  /api/admin/trains        (POST/PUT/DELETE) - ต้อง Auth
  /api/admin/stations      (POST/PUT/DELETE) - ต้อง Auth
  /api/admin/upload        (POST) - ต้อง Auth

  /api/sync/webhook        (POST) - ต้อง API Key
  /api/sync/manual         (POST) - ต้อง Auth
  /api/sync/status         (GET) - ต้อง Auth
```

#### 3. Admin Panel (VM GDCC)
```yaml
Domain: https://admin.srt-timetable.gdcc.com (หรือ /admin route)
Access: VPN + Authentication required
Features:
  - Login (NextAuth.js)
  - Dashboard
  - CRUD รถไฟ/สถานี/ชั้นที่นั่ง
  - Upload รูปภาพ
  - Sync Management (ใหม่)
  - Sync Logs (ใหม่)
```

#### 4. **Sync Service (ใหม่)**
```yaml
Location: VM GDCC (ส่วนหนึ่งของ API Server)
Features:
  - Webhook Receiver (รับข้อมูลจากระบบอื่น)
  - Scheduled Sync (Cron Job)
  - Manual Sync (ผ่าน Admin Panel)
  - Sync Logs & Status
  - Conflict Resolution
  - Retry Mechanism
```

### 📊 Data Flow

#### ผู้ใช้ค้นหารถไฟ:
```
User → Frontend (CDN) → API (/api/public/search) → SQL Server → Response
```

#### Admin แก้ไขข้อมูล:
```
Admin → VPN → Admin Panel → API (/api/admin/trains) → SQL Server → Sync Service
                                                                        ↓
                                                              External System
```

#### Sync จากระบบอื่น:
```
External System → Webhook → API (/api/sync/webhook) → Validate → SQL Server
                                                                      ↓
                                                              Update Frontend Cache
```

---

## 🏗️ Option 2: All-in-One (Simple Deployment)

### Architecture Diagram
```
┌─────────────────────────────────────────────────────────────┐
│                    Public Internet                           │
└──────────┬──────────────────────────────────────────────────┘
           │
┌──────────▼───────────────────────────────────────────────────┐
│  Full Stack Server (VM GDCC)                                 │
│  https://srt-timetable.gdcc.com                              │
│  Next.js Full Stack                                          │
│                                                               │
│  Routes:                                                      │
│  - / (Public)                 ← ไม่ต้อง VPN                  │
│  - /admin/* (Admin)           ← ต้อง VPN + Auth             │
│  - /api/public/* (Public API) ← ไม่ต้อง VPN                  │
│  - /api/admin/* (Admin API)   ← ต้อง Auth                    │
│  - /api/sync/* (Sync API)     ← ต้อง API Key                │
└───────────────────────┬───────────────────────────────────────┘
                        │
             ┌──────────┴──────────┐
             │  SQL Server (VM)    │
             │  localhost:1433     │
             └─────────────────────┘
                        │
                        │ Sync
                        ▼
             ┌──────────────────────┐
             │  External System     │
             │  (คนละ Server)       │
             └──────────────────────┘
```

### Components

```yaml
Platform: VM GDCC เครื่องเดียว
Domain: https://srt-timetable.gdcc.com
Build: Next.js Standalone
Runtime: Node.js 20 + PM2
Web Server: Nginx

Routes:
  - Public: /, /search, /about (ไม่ต้อง VPN)
  - Admin: /admin/* (ต้อง VPN + Auth)
  - API: /api/* (แบ่งตาม Auth)
```

### 📊 Data Flow

```
User (Public) → Nginx → Next.js → SQL Server
Admin (VPN) → Nginx → Next.js Admin → SQL Server → Sync → External
```

---

## 🏗️ Option 3: Microservices (Future-Proof)

### Architecture Diagram
```
┌──────────────────────────────────────────────────────────────────┐
│                       Public Internet                             │
└────┬─────────────────────────┬──────────────────────┬─────────────┘
     │                         │                      │
┌────▼────┐         ┌──────────▼─────────┐   ┌───────▼──────────┐
│Frontend │         │  API Gateway       │   │ Admin SPA        │
│  CDN    │         │  GDCC (Public IP)  │   │ (VPN Only)       │
└─────────┘         │  Nginx/Kong        │   └──────────────────┘
                    └──────────┬─────────┘
                               │
          ┌────────────────────┼────────────────────┐
          │                    │                    │
    ┌─────▼──────┐      ┌─────▼──────┐      ┌─────▼──────┐
    │ Train      │      │ Station    │      │ Sync       │
    │ Service    │      │ Service    │      │ Service    │
    │ (Node.js)  │      │ (Node.js)  │      │ (Node.js)  │
    └─────┬──────┘      └─────┬──────┘      └─────┬──────┘
          │                   │                    │
          └───────────────────┴────────────────────┘
                              │
                   ┌──────────▼──────────┐
                   │  SQL Server (VM)    │
                   │  + Redis (Cache)    │
                   └─────────────────────┘
                              │
                              │ Message Queue (RabbitMQ/Kafka)
                              ▼
                   ┌──────────────────────┐
                   │  External System     │
                   └──────────────────────┘
```

---

## 🔄 Data Sync Strategies (สำหรับทุก Option)

### 1. **Webhook-based Sync** (Real-time)

```typescript
// External System → SRT Timetable
POST /api/sync/webhook
Headers:
  X-API-Key: secret_key_here
  Content-Type: application/json

Body:
{
  "event": "train.updated",
  "timestamp": "2025-10-05T10:30:00Z",
  "data": {
    "trainId": "123",
    "departureTime": "08:00",
    "status": "delayed",
    "delayMinutes": 15
  }
}

// SRT Timetable Response:
{
  "success": true,
  "syncId": "sync_abc123",
  "processedAt": "2025-10-05T10:30:01Z"
}
```

**Implementation:**
```typescript
// app/api/sync/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  // 1. Validate API Key
  const apiKey = req.headers.get('X-API-Key');
  if (apiKey !== process.env.SYNC_API_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Parse Request
  const body = await req.json();
  const { event, data } = body;

  // 3. Process Event
  try {
    switch (event) {
      case 'train.updated':
        await prisma.train.update({
          where: { id: data.trainId },
          data: {
            departureTime: data.departureTime,
            status: data.status,
            delayMinutes: data.delayMinutes,
            lastSyncAt: new Date(),
          },
        });
        break;

      case 'train.created':
        await prisma.train.create({ data: data });
        break;

      case 'train.deleted':
        await prisma.train.delete({ where: { id: data.trainId } });
        break;
    }

    // 4. Log Sync
    await prisma.syncLog.create({
      data: {
        event,
        status: 'success',
        sourceSystem: 'external',
        data: JSON.stringify(data),
      },
    });

    // 5. Invalidate Cache (if using)
    // await redis.del('trains:*');

    return NextResponse.json({ success: true });
  } catch (error) {
    await prisma.syncLog.create({
      data: {
        event,
        status: 'failed',
        sourceSystem: 'external',
        error: error.message,
      },
    });
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 });
  }
}
```

---

### 2. **Scheduled Sync** (Cron Job)

```typescript
// lib/sync/scheduler.ts
import cron from 'node-cron';
import { syncFromExternalSystem } from './sync-service';

// ทุกๆ 5 นาที
cron.schedule('*/5 * * * *', async () => {
  console.log('Starting scheduled sync...');
  try {
    await syncFromExternalSystem();
    console.log('Sync completed successfully');
  } catch (error) {
    console.error('Sync failed:', error);
  }
});

// lib/sync/sync-service.ts
export async function syncFromExternalSystem() {
  // 1. Fetch data from external API
  const response = await fetch('https://external-system.com/api/trains', {
    headers: {
      'Authorization': `Bearer ${process.env.EXTERNAL_API_TOKEN}`,
    },
  });
  const externalTrains = await response.json();

  // 2. Compare with local data
  for (const externalTrain of externalTrains) {
    const localTrain = await prisma.train.findUnique({
      where: { externalId: externalTrain.id },
    });

    // 3. Sync logic
    if (!localTrain) {
      // Create new
      await prisma.train.create({
        data: mapExternalToLocal(externalTrain),
      });
    } else if (isNewer(externalTrain, localTrain)) {
      // Update existing
      await prisma.train.update({
        where: { id: localTrain.id },
        data: mapExternalToLocal(externalTrain),
      });
    }
  }
}
```

---

### 3. **Manual Sync** (ผ่าน Admin Panel)

```typescript
// app/admin/sync/page.tsx
'use client';

export default function SyncPage() {
  const [syncing, setSyncing] = useState(false);

  const handleManualSync = async () => {
    setSyncing(true);
    try {
      const res = await fetch('/api/sync/manual', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      alert(`Synced ${data.count} records`);
    } catch (error) {
      alert('Sync failed');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div>
      <button onClick={handleManualSync} disabled={syncing}>
        {syncing ? 'Syncing...' : 'Sync Now'}
      </button>
    </div>
  );
}
```

---

### 4. **Bidirectional Sync** (Two-way)

```typescript
// ตัวอย่าง: SRT Timetable → External System
export async function pushToExternalSystem(trainId: string) {
  const train = await prisma.train.findUnique({ where: { id: trainId } });

  // Push to external
  await fetch('https://external-system.com/api/trains', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.EXTERNAL_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      id: train.externalId,
      name: train.trainName,
      departureTime: train.departureTime,
      // ... other fields
    }),
  });
}

// Hook: หลังจาก Admin แก้ไขข้อมูล
await prisma.train.update({
  where: { id: trainId },
  data: updatedData,
});

// Push to external system
await pushToExternalSystem(trainId);
```

---

### 5. **Message Queue** (Advanced)

```typescript
// ใช้ BullMQ / RabbitMQ / Kafka
import { Queue, Worker } from 'bullmq';

// Producer: เพิ่ม Job เข้า Queue
const syncQueue = new Queue('sync', {
  connection: { host: 'localhost', port: 6379 },
});

await syncQueue.add('sync-train', {
  trainId: '123',
  action: 'update',
});

// Consumer: ประมวลผล Job
const worker = new Worker('sync', async (job) => {
  const { trainId, action } = job.data;

  if (action === 'update') {
    await syncTrainToExternal(trainId);
  }
}, {
  connection: { host: 'localhost', port: 6379 },
});
```

---

## 📊 Database Schema for Sync

```prisma
// prisma/schema.prisma

model Train {
  id            String   @id @default(cuid())
  externalId    String?  @unique  // ID จากระบบอื่น
  trainNumber   String
  trainName     String
  // ... other fields
  lastSyncAt    DateTime?
  syncSource    String?  // 'internal' | 'external'
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model SyncLog {
  id            String   @id @default(cuid())
  event         String   // 'train.created', 'train.updated', etc.
  status        String   // 'success', 'failed', 'pending'
  sourceSystem  String   // 'internal', 'external'
  targetSystem  String?
  data          String?  // JSON
  error         String?
  retryCount    Int      @default(0)
  processedAt   DateTime?
  createdAt     DateTime @default(now())
}

model SyncConfig {
  id            String   @id @default(cuid())
  systemName    String   @unique  // 'external-system-1'
  apiEndpoint   String
  apiKey        String   // Encrypted
  syncInterval  Int      // minutes
  enabled       Boolean  @default(true)
  lastSyncAt    DateTime?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}
```

---

## 🔒 Security Considerations

### API Authentication
```typescript
// Webhook Authentication
const apiKey = req.headers.get('X-API-Key');
const signature = req.headers.get('X-Signature');

// Verify HMAC Signature
const expectedSignature = crypto
  .createHmac('sha256', process.env.WEBHOOK_SECRET)
  .update(JSON.stringify(body))
  .digest('hex');

if (signature !== expectedSignature) {
  return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
}
```

### Rate Limiting
```typescript
import rateLimit from '@/lib/rate-limit';

const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500,
});

// In API route
await limiter.check(request, 10, 'SYNC_API'); // 10 requests per minute
```

---

## 📝 Comparison Table

| Feature | Option 1: Hybrid | Option 2: All-in-One | Option 3: Microservices |
|---------|------------------|----------------------|-------------------------|
| **Performance** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Scalability** | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Complexity** | ⭐⭐⭐ | ⭐ | ⭐⭐⭐⭐⭐ |
| **Cost** | $$$ | $ | $$$$ |
| **Sync Support** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Deployment Time** | Medium | Fast | Slow |
| **Best For** | Production-ready | Prototype/MVP | Enterprise |

---

## 🎯 Recommendation

### สำหรับตอนนี้:
**Option 2: All-in-One**
- เริ่มง่าย Deploy เร็ว
- ครอบคลุม Requirements ทั้งหมด
- Sync ทำได้ครบ

### สำหรับอนาคต (ถ้า Scale ขึ้น):
**Option 1: Hybrid**
- Frontend ย้ายไป CDN
- API + Admin + Sync อยู่ที่ VM
- Performance ดีขึ้น

### สำหรับระยะยาว (ถ้ามี Traffic เยอะ):
**Option 3: Microservices**
- แยก Service ชัดเจน
- Scale แต่ละส่วนได้อิสระ
- ใช้ Message Queue

---

## 📚 Next Steps

1. ✅ เลือก Option ที่เหมาะสม
2. ⏳ รอ Database Schema
3. ⏳ Setup Prisma + SQL Server
4. ⏳ Implement Sync Service
5. ⏳ ทดสอบ Sync กับระบบอื่น
6. ⏳ Deploy to Production

---

**อัพเดทล่าสุด:** 5 ตุลาคม 2025
