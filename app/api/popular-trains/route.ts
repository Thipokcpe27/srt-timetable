import { NextResponse } from 'next/server';
import { getConnection, sql } from '@/lib/db';
import { formatTime } from '@/lib/formatters';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const topN = parseInt(searchParams.get('limit') || '10');
    
    const pool = await getConnection();
    
    // ใช้ stored procedure sp_GetPopularTrains
    const result = await pool.request()
      .input('topN', sql.Int, topN)
      .execute('sp_GetPopularTrains');
    
    const popularTrains = result.recordset.map((row: any) => ({
      trainId: row.TrainId,
      trainNumber: row.TrainNumber,
      trainName: row.TrainName,
      trainType: row.TrainTypeName,
      origin: row.OriginName,
      destination: row.DestinationName,
      searchCount: row.SearchCount,
      trend: row.Trend,
      rank: row.Rank,
    }));
    
    return NextResponse.json({
      success: true,
      count: popularTrains.length,
      data: popularTrains,
    });
    
  } catch (error: any) {
    console.error('Error fetching popular trains:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch popular trains',
        message: error.message,
      },
      { status: 500 }
    );
  }
}
