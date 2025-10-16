import { NextResponse } from 'next/server';
import { getConnection, sql } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { trainId, origin, destination, classType = '2' } = body;
    
    if (!trainId || !origin || !destination) {
      return NextResponse.json(
        { success: false, error: 'trainId, origin, and destination are required' },
        { status: 400 }
      );
    }
    
    const pool = await getConnection();
    
    // แปลง station code เป็น station ID
    const stationsResult = await pool.request()
      .input('originCode', sql.VarChar, origin)
      .input('destCode', sql.VarChar, destination)
      .query(`
        SELECT 
          (SELECT StationId FROM Stations WHERE StationCode = @originCode) as OriginId,
          (SELECT StationId FROM Stations WHERE StationCode = @destCode) as DestId
      `);
    
    const { OriginId, DestId } = stationsResult.recordset[0];
    
    if (!OriginId || !DestId) {
      return NextResponse.json(
        { success: false, error: 'Invalid station codes' },
        { status: 400 }
      );
    }
    
    // คำนวณค่าโดยสาร
    const fareResult = await pool.request()
      .input('trainId', sql.VarChar, trainId)
      .input('originId', sql.VarChar, OriginId)
      .input('destId', sql.VarChar, DestId)
      .input('classType', sql.VarChar, classType)
      .execute('sp_CalculateFare');
    
    if (!fareResult.recordset || fareResult.recordset.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Unable to calculate fare' },
        { status: 500 }
      );
    }
    
    const fare = fareResult.recordset[0];
    
    return NextResponse.json({
      success: true,
      data: {
        distance: fare.Distance,
        baseFare: fare.BaseFare,
        trainFee: fare.TrainFee,
        acFee: fare.ACFee,
        sleeperFee: fare.SleeperFee,
        totalFare: fare.TotalFare,
        currency: fare.Currency,
      },
    });
    
  } catch (error: any) {
    console.error('Error calculating fare:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to calculate fare',
        message: error.message,
      },
      { status: 500 }
    );
  }
}
