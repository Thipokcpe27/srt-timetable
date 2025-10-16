import { NextResponse } from 'next/server';
import { getConnection, sql } from '@/lib/db';

export async function GET() {
  try {
    const pool = await getConnection();
    
    // ทดสอบดึงข้อมูลสถานีทั้งหมด
    const result = await pool.request()
      .query('SELECT TOP 5 StationCode, NameTH, NameEN, Region FROM Stations WHERE IsActive = 1 ORDER BY StationCode');
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful!',
      stationCount: result.recordset.length,
      stations: result.recordset,
    });
  } catch (error: any) {
    console.error('Database error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}
