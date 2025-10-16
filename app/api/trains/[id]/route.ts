import { NextResponse } from 'next/server';
import { getConnection, sql } from '@/lib/db';
import { 
  formatDuration, 
  formatTime, 
  formatOperatingDays, 
  formatAmenities 
} from '@/lib/formatters';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const trainId = params.id;
    
    const pool = await getConnection();
    
    // ใช้ stored procedure sp_GetTrainDetails
    const result = await pool.request()
      .input('trainId', sql.VarChar, trainId)
      .execute('sp_GetTrainDetails');
    
    if (!result.recordsets || result.recordsets.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Train not found' },
        { status: 404 }
      );
    }
    
    const trainInfo = result.recordsets[0][0]; // ข้อมูลหลัก
    const schedules = result.recordsets[1]; // ตารางเวลา
    const compositions = result.recordsets[2]; // องค์ประกอบตู้โดยสาร
    
    if (!trainInfo) {
      return NextResponse.json(
        { success: false, error: 'Train not found' },
        { status: 404 }
      );
    }
    
    // จัดรูปแบบข้อมูล
    const trainDetails = {
      id: trainInfo.TrainId,
      trainNumber: trainInfo.TrainNumber,
      trainName: trainInfo.TrainName,
      trainType: trainInfo.TrainTypeName,
      origin: {
        code: trainInfo.OriginCode,
        name: trainInfo.OriginName,
      },
      destination: {
        code: trainInfo.DestinationCode,
        name: trainInfo.DestinationName,
      },
      departureTime: formatTime(trainInfo.DepartureTime),
      arrivalTime: formatTime(trainInfo.ArrivalTime),
      duration: trainInfo.DurationMinutes 
        ? formatDuration(trainInfo.DurationMinutes)
        : 'N/A',
      distance: trainInfo.TotalDistanceKm,
      operatingDays: formatOperatingDays(trainInfo.OperatingDays),
      amenities: formatAmenities(trainInfo.Amenities),
      announcement: trainInfo.AnnouncementNote,
      schedules: schedules.map((s: any) => ({
        sequence: s.SequenceNumber,
        stationCode: s.StationCode,
        stationName: s.StationName,
        arrivalTime: s.ArrivalTime ? formatTime(s.ArrivalTime) : null,
        departureTime: s.DepartureTime ? formatTime(s.DepartureTime) : null,
        distance: s.DistanceFromOriginKm,
      })),
      compositions: compositions.map((c: any) => ({
        position: c.Position,
        bogieCode: c.BogieCode,
        bogieName: c.BogieName,
        bogieType: c.BogieTypeName,
        class: {
          id: c.ClassId,
          name: c.ClassName,
        },
        totalSeats: c.TotalSeats,
        availableSeats: c.AvailableSeats,
        features: c.Features ? JSON.parse(c.Features) : [],
      })),
    };
    
    return NextResponse.json({
      success: true,
      data: trainDetails,
    });
    
  } catch (error: any) {
    console.error('Error fetching train details:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch train details',
        message: error.message,
      },
      { status: 500 }
    );
  }
}
