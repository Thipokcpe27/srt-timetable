import { NextResponse } from 'next/server';
import { getConnection, sql } from '@/lib/db';

export async function GET() {
  try {
    const pool = await getConnection();
    
    // ทดสอบดึงข้อมูลภาษาไทย
    const result = await pool.request()
      .query(`
        SELECT TOP 3
          StationCode,
          NameTH,
          NameEN,
          City,
          Region,
          DATALENGTH(NameTH) as NameTH_ByteLength,
          LEN(NameTH) as NameTH_CharLength
        FROM Stations 
        WHERE IsActive = 1
        ORDER BY StationCode
      `);
    
    // Debug: แสดงข้อมูลแบบละเอียด
    const debug = result.recordset.map(row => ({
      code: row.StationCode,
      nameTH: row.NameTH,
      nameEN: row.NameEN,
      city: row.City,
      region: row.Region,
      byteLength: row.NameTH_ByteLength,
      charLength: row.NameTH_CharLength,
      // แปลงเป็น hex เพื่อดู encoding
      nameThHex: Buffer.from(row.NameTH || '', 'utf16le').toString('hex').substring(0, 50),
    }));
    
    return NextResponse.json({
      success: true,
      data: result.recordset,
      debug,
      encoding: {
        nodeDefault: process.env.LANG || 'N/A',
        platform: process.platform,
      }
    });
    
  } catch (error: any) {
    console.error('Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}
