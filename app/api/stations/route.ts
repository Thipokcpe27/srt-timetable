import { NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';
import type { Station } from '@/lib/types';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const region = searchParams.get('region');
    
    const pool = await getConnection();
    
    let query = `
      SELECT 
        StationId as id,
        StationCode as code,
        NameTH as name,
        City as city,
        Region as region,
        Latitude as latitude,
        Longitude as longitude,
        Facilities as facilities
      FROM Stations 
      WHERE IsActive = 1
    `;
    
    const request_query = pool.request();
    
    if (region) {
      query += ' AND Region = @region';
      request_query.input('region', region);
    }
    
    query += ' ORDER BY Region, NameTH';
    
    const result = await request_query.query(query);
    
    const stations: Station[] = result.recordset.map((row: any) => ({
      id: row.code, // ใช้ StationCode เป็น id (เช่น 'BKK')
      name: row.name,
      code: row.code,
      city: row.city,
      region: row.region,
    }));
    
    return NextResponse.json({
      success: true,
      count: stations.length,
      data: stations,
    });
    
  } catch (error: any) {
    console.error('Error fetching stations:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch stations',
        message: error.message,
      },
      { status: 500 }
    );
  }
}
