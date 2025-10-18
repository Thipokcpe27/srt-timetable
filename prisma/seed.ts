/**
 * Database Seed Script
 * Seeds initial data for development
 */

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data (development only)
  console.log('🧹 Cleaning existing data...');
  await prisma.trainStop.deleteMany();
  await prisma.train.deleteMany();
  await prisma.trainType.deleteMany();
  await prisma.station.deleteMany();
  await prisma.adminLog.deleteMany();
  await prisma.adminUser.deleteMany();
  await prisma.adminRole.deleteMany();

  // ============================================
  // 1. TRAIN TYPES (ประเภทรถ)
  // ============================================
  console.log('🚂 Seeding train types...');
  
  const trainTypes = await Promise.all([
    prisma.trainType.create({
      data: {
        code: 'express_special',
        nameTh: 'ด่วนพิเศษ',
        nameEn: 'Special Express',
        nameCn: '特快',
        baseFare: 170,
        sortOrder: 1,
        color: '#FF6B6B',
      },
    }),
    prisma.trainType.create({
      data: {
        code: 'express_special_cnr',
        nameTh: 'ด่วนพิเศษ (CNR)',
        nameEn: 'Special Express (CNR)',
        nameCn: '特快 (CNR)',
        baseFare: 190,
        sortOrder: 2,
        color: '#FF5252',
      },
    }),
    prisma.trainType.create({
      data: {
        code: 'express',
        nameTh: 'ด่วน',
        nameEn: 'Express',
        nameCn: '快车',
        baseFare: 150,
        sortOrder: 3,
        color: '#4ECDC4',
      },
    }),
    prisma.trainType.create({
      data: {
        code: 'rapid',
        nameTh: 'เร็ว',
        nameEn: 'Rapid',
        nameCn: '快速',
        baseFare: 20,
        sortOrder: 4,
        color: '#95E1D3',
      },
    }),
    prisma.trainType.create({
      data: {
        code: 'ordinary',
        nameTh: 'ธรรมดา',
        nameEn: 'Ordinary',
        nameCn: '普通',
        baseFare: 0,
        sortOrder: 5,
        color: '#A8E6CF',
      },
    }),
    prisma.trainType.create({
      data: {
        code: 'local',
        nameTh: 'ท้องถิ่น',
        nameEn: 'Local',
        nameCn: '本地',
        baseFare: 0,
        sortOrder: 6,
        color: '#C7CEEA',
      },
    }),
    prisma.trainType.create({
      data: {
        code: 'commuter',
        nameTh: 'ชานเมือง',
        nameEn: 'Commuter',
        nameCn: '市郊',
        baseFare: 0,
        sortOrder: 7,
        color: '#B8B8FF',
      },
    }),
    prisma.trainType.create({
      data: {
        code: 'special_commuter',
        nameTh: 'พิเศษชานเมือง',
        nameEn: 'Special Commuter',
        nameCn: '特殊市郊',
        baseFare: 0,
        sortOrder: 8,
        color: '#9B9BFF',
      },
    }),
  ]);

  console.log(`✅ Created ${trainTypes.length} train types`);

  // ============================================
  // 2. STATIONS (สถานี)
  // ============================================
  console.log('🏢 Seeding stations...');

  const stations = await Promise.all([
    // Bangkok (กรุงเทพ)
    prisma.station.create({
      data: {
        stationCode: 1,
        codeTh: 'กท',
        codeEn: 'BKK',
        codeCn: '曼',
        nameTh: 'กรุงเทพ (หัวลำโพง)',
        nameEn: 'Bangkok (Hua Lamphong)',
        nameCn: '曼谷 (华南蓬)',
        displayNameTh: 'กรุงเทพ',
        displayNameEn: 'Bangkok',
        displayNameCn: '曼谷',
        distanceForPricing: 0,
        distanceActual: 0,
        stationClass: 'special',
        latitude: 13.7373,
        longitude: 100.5168,
        facilities: JSON.stringify(['ATM', 'WiFi', 'Restaurant', 'Waiting Room', 'Ticket Office']),
        isActive: true,
      },
    }),
    
    // Don Mueang (ดอนเมือง)
    prisma.station.create({
      data: {
        stationCode: 1001,
        codeTh: 'ดม',
        codeEn: 'DMK',
        codeCn: '廊曼',
        nameTh: 'ดอนเมือง',
        nameEn: 'Don Mueang',
        nameCn: '廊曼',
        distanceForPricing: 15.8,
        distanceActual: 15.8,
        stationClass: '1',
        latitude: 13.9116,
        longitude: 100.6078,
        facilities: JSON.stringify(['ATM', 'WiFi', 'Airport Connection']),
        isActive: true,
      },
    }),

    // Ayutthaya (อยุธยา)
    prisma.station.create({
      data: {
        stationCode: 1059,
        codeTh: 'อย',
        codeEn: 'AYA',
        codeCn: '大城',
        nameTh: 'อยุธยา',
        nameEn: 'Ayutthaya',
        nameCn: '大城',
        distanceForPricing: 71.8,
        distanceActual: 71.8,
        stationClass: '1',
        latitude: 14.3537,
        longitude: 100.5603,
        facilities: JSON.stringify(['ATM', 'WiFi', 'Restaurant', 'Waiting Room']),
        isActive: true,
      },
    }),

    // Lopburi (ลพบุรี)
    prisma.station.create({
      data: {
        stationCode: 1081,
        codeTh: 'ลบ',
        codeEn: 'LPB',
        codeCn: '华富里',
        nameTh: 'ลพบุรี',
        nameEn: 'Lopburi',
        nameCn: '华富里',
        distanceForPricing: 132.2,
        distanceActual: 132.2,
        stationClass: '1',
        latitude: 14.7995,
        longitude: 100.6195,
        facilities: JSON.stringify(['ATM', 'WiFi', 'Restaurant']),
        isActive: true,
      },
    }),

    // Phitsanulok (พิษณุโลก)
    prisma.station.create({
      data: {
        stationCode: 1129,
        codeTh: 'พล',
        codeEn: 'PSL',
        codeCn: '彭世洛',
        nameTh: 'พิษณุโลก',
        nameEn: 'Phitsanulok',
        nameCn: '彭世洛',
        distanceForPricing: 377.4,
        distanceActual: 377.4,
        stationClass: '1',
        latitude: 16.8219,
        longitude: 100.2658,
        facilities: JSON.stringify(['ATM', 'WiFi', 'Restaurant', 'Waiting Room']),
        isActive: true,
      },
    }),

    // Lampang (ลำปาง)
    prisma.station.create({
      data: {
        stationCode: 1149,
        codeTh: 'ลป',
        codeEn: 'LPG',
        codeCn: '南邦',
        nameTh: 'ลำปาง',
        nameEn: 'Lampang',
        nameCn: '南邦',
        distanceForPricing: 516.9,
        distanceActual: 516.9,
        stationClass: '1',
        latitude: 18.2883,
        longitude: 99.5114,
        facilities: JSON.stringify(['ATM', 'WiFi', 'Restaurant']),
        isActive: true,
      },
    }),

    // Chiang Mai (เชียงใหม่)
    prisma.station.create({
      data: {
        stationCode: 1159,
        codeTh: 'ชม',
        codeEn: 'CNX',
        codeCn: '清迈',
        nameTh: 'เชียงใหม่',
        nameEn: 'Chiang Mai',
        nameCn: '清迈',
        distanceForPricing: 751.4,
        distanceActual: 751.4,
        stationClass: 'special',
        latitude: 18.7948,
        longitude: 98.9963,
        facilities: JSON.stringify(['ATM', 'WiFi', 'Restaurant', 'Waiting Room', 'Ticket Office']),
        isActive: true,
      },
    }),

    // Nakhon Ratchasima (Korat) (นครราชสีมา)
    prisma.station.create({
      data: {
        stationCode: 2001,
        codeTh: 'นม',
        codeEn: 'NKR',
        codeCn: '呵叻',
        nameTh: 'นครราชสีมา (โคราช)',
        nameEn: 'Nakhon Ratchasima (Korat)',
        nameCn: '呵叻',
        displayNameTh: 'นครราชสีมา',
        displayNameEn: 'Nakhon Ratchasima',
        distanceForPricing: 264.1,
        distanceActual: 264.1,
        stationClass: '1',
        latitude: 14.9730,
        longitude: 102.0977,
        facilities: JSON.stringify(['ATM', 'WiFi', 'Restaurant', 'Waiting Room']),
        isActive: true,
      },
    }),

    // Udon Thani (อุดรธานี)
    prisma.station.create({
      data: {
        stationCode: 2059,
        codeTh: 'อด',
        codeEn: 'UDN',
        codeCn: '乌隆',
        nameTh: 'อุดรธานี',
        nameEn: 'Udon Thani',
        nameCn: '乌隆',
        distanceForPricing: 568.6,
        distanceActual: 568.6,
        stationClass: '1',
        latitude: 17.3644,
        longitude: 102.8146,
        facilities: JSON.stringify(['ATM', 'WiFi', 'Restaurant', 'Waiting Room']),
        isActive: true,
      },
    }),

    // Nong Khai (หนองคาย)
    prisma.station.create({
      data: {
        stationCode: 2071,
        codeTh: 'นค',
        codeEn: 'NKI',
        codeCn: '廊开',
        nameTh: 'หนองคาย',
        nameEn: 'Nong Khai',
        nameCn: '廊开',
        distanceForPricing: 624.2,
        distanceActual: 624.2,
        stationClass: '1',
        latitude: 17.8782,
        longitude: 102.7412,
        facilities: JSON.stringify(['ATM', 'WiFi', 'Restaurant', 'Border Crossing']),
        isActive: true,
      },
    }),

    // Hat Yai (หาดใหญ่)
    prisma.station.create({
      data: {
        stationCode: 4501,
        codeTh: 'หย',
        codeEn: 'HTY',
        codeCn: '合艾',
        nameTh: 'หาดใหญ่',
        nameEn: 'Hat Yai',
        nameCn: '合艾',
        distanceForPricing: 945.1,
        distanceActual: 945.1,
        stationClass: '1',
        latitude: 7.0078,
        longitude: 100.4768,
        facilities: JSON.stringify(['ATM', 'WiFi', 'Restaurant', 'Waiting Room', 'Ticket Office']),
        isActive: true,
      },
    }),

    // Surat Thani (สุราษฎร์ธานี)
    prisma.station.create({
      data: {
        stationCode: 4001,
        codeTh: 'สฎ',
        codeEn: 'SRT',
        codeCn: '素叻',
        nameTh: 'สุราษฎร์ธานี',
        nameEn: 'Surat Thani',
        nameCn: '素叻',
        distanceForPricing: 651.1,
        distanceActual: 651.1,
        stationClass: '1',
        latitude: 9.1382,
        longitude: 99.3339,
        facilities: JSON.stringify(['ATM', 'WiFi', 'Restaurant', 'Waiting Room']),
        isActive: true,
      },
    }),

    // Hua Hin (หัวหิน)
    prisma.station.create({
      data: {
        stationCode: 3501,
        codeTh: 'หห',
        codeEn: 'HHN',
        codeCn: '华欣',
        nameTh: 'หัวหิน',
        nameEn: 'Hua Hin',
        nameCn: '华欣',
        distanceForPricing: 229.2,
        distanceActual: 229.2,
        stationClass: '2',
        latitude: 12.5704,
        longitude: 99.9574,
        facilities: JSON.stringify(['ATM', 'WiFi', 'Tourist Info']),
        isActive: true,
      },
    }),

    // Prachuap Khiri Khan (ประจวบคีรีขันธ์)
    prisma.station.create({
      data: {
        stationCode: 3521,
        codeTh: 'ปข',
        codeEn: 'PKN',
        codeCn: '巴蜀',
        nameTh: 'ประจวบคีรีขันธ์',
        nameEn: 'Prachuap Khiri Khan',
        nameCn: '巴蜀',
        distanceForPricing: 318.4,
        distanceActual: 318.4,
        stationClass: '2',
        latitude: 11.8125,
        longitude: 99.7978,
        facilities: JSON.stringify(['ATM', 'WiFi']),
        isActive: true,
      },
    }),
  ]);

  console.log(`✅ Created ${stations.length} stations`);

  // ============================================
  // 3. TRAINS (ขบวนรถ)
  // ============================================
  console.log('🚆 Seeding trains...');

  const bangkok = stations[0];
  const chiangMai = stations[6];
  const nongKhai = stations[9];
  const hatYai = stations[10];
  const ayutthaya = stations[2];

  const trains = await Promise.all([
    // Train 1: Bangkok - Chiang Mai (Special Express)
    prisma.train.create({
      data: {
        trainNumber: '1',
        trainNameTh: 'พิเศษด่วน กรุงเทพ - เชียงใหม่',
        trainNameEn: 'Special Express Bangkok - Chiang Mai',
        trainNameCn: '特快 曼谷 - 清迈',
        trainTypeId: trainTypes[0].id,
        originStationId: bangkok.id,
        destinationStationId: chiangMai.id,
        departureTime: new Date('2024-01-01T18:00:00'),
        arrivalTime: new Date('2024-01-02T07:45:00'),
        durationMinutes: 825,
        operatingDays: 'daily',
        runningOrder: 1,
        totalDistanceKm: 751.4,
        isActive: true,
      },
    }),

    // Train 2: Chiang Mai - Bangkok (Special Express)
    prisma.train.create({
      data: {
        trainNumber: '2',
        trainNameTh: 'พิเศษด่วน เชียงใหม่ - กรุงเทพ',
        trainNameEn: 'Special Express Chiang Mai - Bangkok',
        trainNameCn: '特快 清迈 - 曼谷',
        trainTypeId: trainTypes[0].id,
        originStationId: chiangMai.id,
        destinationStationId: bangkok.id,
        departureTime: new Date('2024-01-01T17:00:00'),
        arrivalTime: new Date('2024-01-02T06:35:00'),
        durationMinutes: 815,
        operatingDays: 'daily',
        runningOrder: 2,
        totalDistanceKm: 751.4,
        isActive: true,
      },
    }),

    // Train 25: Bangkok - Nong Khai (Express)
    prisma.train.create({
      data: {
        trainNumber: '25',
        trainNameTh: 'ด่วน กรุงเทพ - หนองคาย',
        trainNameEn: 'Express Bangkok - Nong Khai',
        trainNameCn: '快车 曼谷 - 廊开',
        trainTypeId: trainTypes[2].id,
        originStationId: bangkok.id,
        destinationStationId: nongKhai.id,
        departureTime: new Date('2024-01-01T20:00:00'),
        arrivalTime: new Date('2024-01-02T08:00:00'),
        durationMinutes: 720,
        operatingDays: 'daily',
        runningOrder: 25,
        totalDistanceKm: 624.2,
        isActive: true,
      },
    }),

    // Train 26: Nong Khai - Bangkok (Express)
    prisma.train.create({
      data: {
        trainNumber: '26',
        trainNameTh: 'ด่วน หนองคาย - กรุงเทพ',
        trainNameEn: 'Express Nong Khai - Bangkok',
        trainNameCn: '快车 廊开 - 曼谷',
        trainTypeId: trainTypes[2].id,
        originStationId: nongKhai.id,
        destinationStationId: bangkok.id,
        departureTime: new Date('2024-01-01T18:00:00'),
        arrivalTime: new Date('2024-01-02T06:00:00'),
        durationMinutes: 720,
        operatingDays: 'daily',
        runningOrder: 26,
        totalDistanceKm: 624.2,
        isActive: true,
      },
    }),

    // Train 31: Bangkok - Hat Yai (Special Express)
    prisma.train.create({
      data: {
        trainNumber: '31',
        trainNameTh: 'พิเศษด่วน กรุงเทพ - หาดใหญ่',
        trainNameEn: 'Special Express Bangkok - Hat Yai',
        trainNameCn: '特快 曼谷 - 合艾',
        trainTypeId: trainTypes[0].id,
        originStationId: bangkok.id,
        destinationStationId: hatYai.id,
        departureTime: new Date('2024-01-01T14:00:00'),
        arrivalTime: new Date('2024-01-02T05:00:00'),
        durationMinutes: 900,
        operatingDays: 'daily',
        runningOrder: 31,
        totalDistanceKm: 945.1,
        isActive: true,
      },
    }),

    // Train 32: Hat Yai - Bangkok (Special Express)
    prisma.train.create({
      data: {
        trainNumber: '32',
        trainNameTh: 'พิเศษด่วน หาดใหญ่ - กรุงเทพ',
        trainNameEn: 'Special Express Hat Yai - Bangkok',
        trainNameCn: '特快 合艾 - 曼谷',
        trainTypeId: trainTypes[0].id,
        originStationId: hatYai.id,
        destinationStationId: bangkok.id,
        departureTime: new Date('2024-01-01T13:30:00'),
        arrivalTime: new Date('2024-01-02T04:30:00'),
        durationMinutes: 900,
        operatingDays: 'daily',
        runningOrder: 32,
        totalDistanceKm: 945.1,
        isActive: true,
      },
    }),
  ]);

  console.log(`✅ Created ${trains.length} trains`);

  // ============================================
  // 4. ADMIN ROLES & USERS
  // ============================================
  console.log('👤 Seeding admin roles and users...');

  const superAdminRole = await prisma.adminRole.create({
    data: {
      code: 'super_admin',
      nameTh: 'ผู้ดูแลระบบสูงสุด',
      nameEn: 'Super Administrator',
      permissions: JSON.stringify([
        'manage_stations',
        'manage_trains',
        'manage_prices',
        'manage_announcements',
        'manage_users',
        'manage_roles',
        'view_logs',
      ]),
      isActive: true,
    },
  });

  const adminRole = await prisma.adminRole.create({
    data: {
      code: 'admin',
      nameTh: 'ผู้ดูแลระบบ',
      nameEn: 'Administrator',
      permissions: JSON.stringify([
        'manage_stations',
        'manage_trains',
        'manage_prices',
        'manage_announcements',
        'view_logs',
      ]),
      isActive: true,
    },
  });

  // Create default super admin user
  const hashedPassword = await bcrypt.hash('Admin123!', 10);
  
  const adminUser = await prisma.adminUser.create({
    data: {
      username: 'admin',
      email: 'admin@srt-timetable.local',
      passwordHash: hashedPassword,
      fullName: 'System Administrator',
      roleId: superAdminRole.id,
      isActive: true,
    },
  });

  console.log(`✅ Created admin roles and default user (username: admin, password: Admin123!)`);

  // ============================================
  // SUMMARY
  // ============================================
  console.log('\n🎉 Seed completed successfully!');
  console.log('=====================================');
  console.log(`📊 Train Types: ${trainTypes.length}`);
  console.log(`🏢 Stations: ${stations.length}`);
  console.log(`🚆 Trains: ${trains.length}`);
  console.log(`👤 Admin Users: 1`);
  console.log(`🔑 Admin Roles: 2`);
  console.log('=====================================');
  console.log('\n📝 Login Credentials:');
  console.log('   Username: admin');
  console.log('   Password: Admin123!');
  console.log('=====================================\n');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
