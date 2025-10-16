import { NextResponse } from 'next/server';
import { getConnection, sql } from '@/lib/db';
import { 
  formatDuration, 
  formatTime, 
  formatOperatingDays, 
  formatAmenities,
  calculateDuration 
} from '@/lib/formatters';
import type { Train, TrainClass, StopSchedule } from '@/lib/types';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { origin, destination } = body;
    
    if (!origin || !destination) {
      return NextResponse.json(
        { success: false, error: 'Origin and destination are required' },
        { status: 400 }
      );
    }
    
    const pool = await getConnection();
    
    // ค้นหาขบวนรถไฟที่ตรงกับเส้นทาง
    const trainsResult = await pool.request()
      .input('originCode', sql.VarChar, origin)
      .input('destCode', sql.VarChar, destination)
      .query(`
        SELECT 
          t.TrainId,
          t.TrainNumber,
          t.TrainName,
          t.DepartureTime,
          t.ArrivalTime,
          t.DurationMinutes,
          t.TotalDistanceKm,
          t.Amenities,
          t.OperatingDays,
          tt.NameTH as TrainTypeName,
          o.StationCode as OriginCode,
          o.NameTH as OriginName,
          d.StationCode as DestCode,
          d.NameTH as DestName
        FROM Trains t
        JOIN TrainTypes tt ON t.TrainTypeId = tt.TrainTypeId
        JOIN Stations o ON t.OriginStationId = o.StationId
        JOIN Stations d ON t.DestinationStationId = d.StationId
        WHERE o.StationCode = @originCode
          AND d.StationCode = @destCode
          AND t.IsActive = 1
        ORDER BY t.DepartureTime
      `);
    
    if (trainsResult.recordset.length === 0) {
      return NextResponse.json({
        success: true,
        count: 0,
        data: [],
        message: 'ไม่พบขบวนรถไฟที่ตรงกับเงื่อนไข',
      });
    }
    
    // สร้างข้อมูล trains แบบละเอียด
    const trains: Train[] = await Promise.all(
      trainsResult.recordset.map(async (row: any) => {
        try {
          // ดึงตารางเวลา (stops)
          const schedulesResult = await pool.request()
            .input('trainId', sql.VarChar, row.TrainId)
            .query(`
              SELECT 
                ts.SequenceNumber,
                s.StationCode as StationId,
                s.NameTH as StationName,
                ts.ArrivalTime,
                ts.DepartureTime,
                ts.DistanceFromOriginKm
              FROM TrainSchedules ts
              JOIN Stations s ON ts.StationId = s.StationId
              WHERE ts.TrainId = @trainId
                AND ts.IsActive = 1
              ORDER BY ts.SequenceNumber
            `);
          
          const stopSchedules: StopSchedule[] = schedulesResult.recordset.map((s: any) => ({
            stationId: s.StationId,
            arrivalTime: s.ArrivalTime ? formatTime(s.ArrivalTime) : null,
            departureTime: s.DepartureTime ? formatTime(s.DepartureTime) : null,
          }));
        
          // ดึงชั้นที่นั่ง (classes) และราคา
          const classesResult = await pool.request()
            .input('trainId', sql.VarChar, row.TrainId)
            .query(`
              SELECT DISTINCT
                tc.ClassId,
                tc.ClassName,
                tc.TotalSeats,
                tc.AvailableSeats
              FROM TrainCompositions tc
              WHERE tc.TrainId = @trainId
                AND tc.IsActive = 1
              ORDER BY 
                CASE tc.ClassId
                  WHEN 'first' THEN 1
                  WHEN 'business' THEN 2
                  WHEN 'economy' THEN 3
                  ELSE 4
                END
            `);
          
          // ถ้าไม่มีข้อมูล composition ให้ใช้ค่า default
          const classes: TrainClass[] = classesResult.recordset.length > 0
            ? await Promise.all(
                classesResult.recordset.map(async (c: any) => {
                  try {
                    // คำนวณราคา
                    let classType = '2'; // Default
                    if (c.ClassId === 'first' || c.ClassId === '1') classType = '1';
                    if (c.ClassId === 'economy' || c.ClassId === '3') classType = '3';
                    
                    const fareResult = await pool.request()
                      .input('trainId', sql.VarChar, row.TrainId)
                      .input('originCode', sql.VarChar, origin)
                      .input('destCode', sql.VarChar, destination)
                      .input('classType', sql.VarChar, classType)
                      .query(`
                        DECLARE @OriginId VARCHAR(50) = (SELECT StationId FROM Stations WHERE StationCode = @originCode);
                        DECLARE @DestId VARCHAR(50) = (SELECT StationId FROM Stations WHERE StationCode = @destCode);
                        
                        EXEC sp_CalculateFare 
                          @TrainId = @trainId,
                          @OriginStationId = @OriginId,
                          @DestinationStationId = @DestId,
                          @ClassType = @classType;
                      `);
                    
                    const fare = fareResult.recordset[0];
                    
                    // กำหนด features ตามชั้น
                    let features: string[] = [];
                    if (c.ClassId === 'first' || c.ClassId === '1') {
                      features = ['ที่นั่งปรับเอนได้', 'Wi-Fi ความเร็วสูง', 'อาหารว่างฟรี', 'ห้องน้ำส่วนตัว'];
                    } else if (c.ClassId === 'business') {
                      features = ['ที่นั่งสบาย', 'Wi-Fi', 'เครื่องดื่มฟรี', 'ปลั๊กไฟ'];
                    } else {
                      features = ['ที่นั่งมาตรฐาน', 'ปลั๊กไฟ', 'ห้องน้ำรวม'];
                    }
                    
                    return {
                      id: c.ClassId,
                      name: c.ClassName || c.ClassId,
                      price: fare?.TotalFare || 0,
                      features,
                      available: c.AvailableSeats || 0,
                      totalSeats: c.TotalSeats || 0,
                    };
                  } catch (error) {
                    console.error(`Error calculating fare for class ${c.ClassId}:`, error);
                    // Return default class info if fare calculation fails
                    return {
                      id: c.ClassId,
                      name: c.ClassName || c.ClassId,
                      price: 0,
                      features: ['ที่นั่งมาตรฐาน'],
                      available: c.AvailableSeats || 0,
                      totalSeats: c.TotalSeats || 0,
                    };
                  }
                })
              )
            : [
                // Default classes if no composition data
                {
                  id: 'economy',
                  name: 'ชั้นประหยัด',
                  price: 0,
                  features: ['ที่นั่งมาตรฐาน'],
                  available: 50,
                  totalSeats: 50,
                },
              ];
        
          // สร้าง array ของ stops (เฉพาะ StationCode ของสถานีระหว่างทาง)
          const stops = stopSchedules.length > 0
            ? stopSchedules.slice(1, -1).map(s => s.stationId)
            : [];
          
          return {
            id: row.TrainId,
            trainNumber: row.TrainNumber,
            trainName: row.TrainName,
            origin: row.OriginCode,
            destination: row.DestCode,
            departureTime: formatTime(row.DepartureTime),
            arrivalTime: formatTime(row.ArrivalTime),
            duration: row.DurationMinutes 
              ? formatDuration(row.DurationMinutes)
              : calculateDuration(formatTime(row.DepartureTime), formatTime(row.ArrivalTime)),
            stops,
            stopSchedules: stopSchedules.length > 0 ? stopSchedules : [
              { stationId: row.OriginCode, arrivalTime: null, departureTime: formatTime(row.DepartureTime) },
              { stationId: row.DestCode, arrivalTime: formatTime(row.ArrivalTime), departureTime: null },
            ],
            classes,
            amenities: formatAmenities(row.Amenities),
            operatingDays: formatOperatingDays(row.OperatingDays),
          };
        } catch (error) {
          console.error(`Error processing train ${row.TrainId}:`, error);
          // Return minimal train info if processing fails
          return {
            id: row.TrainId,
            trainNumber: row.TrainNumber,
            trainName: row.TrainName,
            origin: row.OriginCode,
            destination: row.DestCode,
            departureTime: formatTime(row.DepartureTime),
            arrivalTime: formatTime(row.ArrivalTime),
            duration: row.DurationMinutes 
              ? formatDuration(row.DurationMinutes)
              : 'N/A',
            stops: [],
            stopSchedules: [],
            classes: [],
            amenities: [],
            operatingDays: ['daily'],
          };
        }
      })
    );
    
    return NextResponse.json({
      success: true,
      count: trains.length,
      data: trains,
      searchParams: { origin, destination },
    });
    
  } catch (error: any) {
    console.error('Error searching trains:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to search trains',
        message: error.message,
      },
      { status: 500 }
    );
  }
}
