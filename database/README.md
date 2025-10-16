# Database Setup Guide

## ขั้นตอนการติดตั้งฐานข้อมูล

### 1. รันสคริปต์สร้างฐานข้อมูลและตาราง

เปิด SQL Server Management Studio (SSMS) หรือใช้ `sqlcmd`:

```bash
sqlcmd -S localhost -U sa -P admin123 -i "D:\Project\timetable\database\01-create-database-and-tables.sql"
```

หรือใน SSMS:
1. เชื่อมต่อด้วย user `sa` password `admin123`
2. เปิดไฟล์ `01-create-database-and-tables.sql`
3. กด Execute (F5)

**ผลลัพธ์:** สร้างฐานข้อมูล `RailwayManagement` และตาราง 15 ตาราง

---

### 2. รันสคริปต์เพิ่มข้อมูล Mock

```bash
sqlcmd -S localhost -U sa -P admin123 -i "D:\Project\timetable\database\02-insert-mock-data.sql"
```

**ผลลัพธ์:** เพิ่มข้อมูลทดสอบ:
- สถานี 13 สถานี (กรุงเทพ, เชียงใหม่, หาดใหญ่, ฯลฯ)
- ขบวนรถไฟ 9 ขบวน
- ตารางเวลา 3 ขบวน
- อัตราค่าโดยสาร
- ผู้ใช้งาน 2 คน

---

### 3. รันสคริปต์สร้าง Stored Procedures

```bash
sqlcmd -S localhost -U sa -P admin123 -i "D:\Project\timetable\database\03-create-stored-procedures.sql"
```

**ผลลัพธ์:** สร้าง 7 stored procedures สำหรับการทำงาน

---

## ทดสอบฐานข้อมูล

### ทดสอบการค้นหารถไฟ

```sql
USE RailwayManagement;
GO

-- ค้นหาขบวนรถไฟจากกรุงเทพไปเชียงใหม่
EXEC sp_SearchTrains 
    @OriginStationId = 'STN001',  -- กรุงเทพ
    @DestinationStationId = 'STN006'; -- เชียงใหม่
```

### ทดสอบการคำนวณค่าโดยสาร

```sql
-- คำนวณค่าโดยสารขบวน 1 กทม-เชียงใหม่ ชั้น 2
EXEC sp_CalculateFare
    @TrainId = 'TRN001',
    @OriginStationId = 'STN001',
    @DestinationStationId = 'STN006',
    @ClassType = '2';
```

### ทดสอบดึงตารางเวลา

```sql
-- ดูตารางเวลาของขบวน 1
EXEC sp_GetTrainSchedule @TrainId = 'TRN001';
```

### ทดสอบดึงสถานีทั้งหมด

```sql
-- ดูสถานีทั้งหมด
EXEC sp_GetAllStations;

-- ดูสถานีในภาคเหนือ
EXEC sp_GetAllStations @Region = N'เหนือ';
```

---

## ข้อมูลสำคัญ

### Stations (13 สถานี)

| StationId | StationCode | NameTH | Region |
|-----------|-------------|---------|---------|
| STN001 | BKK | กรุงเทพ | กลาง |
| STN002 | AYA | อยุธยา | กลาง |
| STN003 | LPI | ลพบุรี | กลาง |
| STN004 | PKN | พิษณุโลก | เหนือ |
| STN005 | LPG | ลำปาง | เหนือ |
| STN006 | CNX | เชียงใหม่ | เหนือ |
| STN007 | KKN | ขอนแก่น | อีสาน |
| STN008 | UDN | อุดรธานี | อีสาน |
| STN009 | NMA | นครราชสีมา | อีสาน |
| STN010 | HYI | หัวหิน | ใต้ |
| STN011 | CPN | ชุมพร | ใต้ |
| STN012 | SKA | สุราษฎร์ธานี | ใต้ |
| STN013 | HYA | หาดใหญ่ | ใต้ |

### Trains (9 ขบวน)

| TrainId | TrainNumber | TrainName | Route |
|---------|-------------|-----------|--------|
| TRN001 | 1 | ด่วนพิเศษ 1 | กรุงเทพ-เชียงใหม่ |
| TRN002 | 3 | ด่วนพิเศษ 3 | กรุงเทพ-เชียงใหม่ |
| TRN003 | 13 | ด่วน 13 | กรุงเทพ-เชียงใหม่ |
| TRN004 | 25 | ด่วนพิเศษ 25 | กรุงเทพ-อุดรธานี |
| TRN005 | 69 | ด่วน 69 | กรุงเทพ-อุดรธานี |
| TRN006 | 31 | ด่วนพิเศษ 31 | กรุงเทพ-หาดใหญ่ |
| TRN007 | 83 | ด่วน 83 | กรุงเทพ-หาดใหญ่ |
| TRN008 | 23 | ด่วน 23 | กรุงเทพ-โคราช |
| TRN009 | 137 | เร็ว 137 | กรุงเทพ-โคราช |

### Users (2 คน)

| Username | Password | Role |
|----------|----------|------|
| admin | admin123 | SUPER_ADMIN |
| manager | admin123 | ADMIN |

*หมายเหตุ: รหัสผ่านควรเข้ารหัสด้วย bcrypt ในระบบจริง*

---

## รีเซ็ตฐานข้อมูล

หากต้องการเริ่มใหม่:

```sql
USE master;
GO

-- ปิดการเชื่อมต่อทั้งหมด
ALTER DATABASE RailwayManagement SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
GO

-- ลบฐานข้อมูล
DROP DATABASE RailwayManagement;
GO
```

จากนั้นรันสคริปต์ 01, 02, 03 ใหม่อีกครั้ง

---

## ขั้นตอนถัดไป

1. ✅ สร้างฐานข้อมูลและตาราง
2. ✅ เพิ่มข้อมูล Mock
3. ✅ สร้าง Stored Procedures
4. ⏳ เชื่อมต่อจาก Next.js
5. ⏳ สร้าง API Routes
6. ⏳ ทดสอบระบบ
