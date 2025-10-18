import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, ErrorCodes } from '@/lib/api-response';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const originId = searchParams.get('origin');
    const destinationId = searchParams.get('destination');

    if (!originId || !destinationId) {
      return errorResponse(
        ErrorCodes.VALIDATION_ERROR,
        'Origin and destination are required',
        400,
        { originId, destinationId }
      );
    }

    logger.info('[Train Search API] Searching trains', undefined, {
      originId,
      destinationId,
    });

    // Parse IDs
    const parsedOriginId = parseInt(originId);
    const parsedDestinationId = parseInt(destinationId);

    if (isNaN(parsedOriginId) || isNaN(parsedDestinationId)) {
      return errorResponse(
        ErrorCodes.VALIDATION_ERROR,
        'Invalid station IDs',
        400,
        { originId, destinationId }
      );
    }

    // Find trains that match the route
    const trains = await prisma.train.findMany({
      where: {
        AND: [
          { originStationId: parsedOriginId, destinationStationId: parsedDestinationId },
          { isActive: true },
        ],
      },
      include: {
        trainType: true,
        originStation: true,
        destinationStation: true,
        trainStops: {
          include: {
            station: true,
          },
          orderBy: {
            stopOrder: 'asc',
          },
        },
      },
      orderBy: {
        departureTime: 'asc',
      },
    });

    // Transform data to match frontend format
    const transformedTrains = trains.map((train) => {
      // Calculate duration in Thai format
      const hours = Math.floor((train.durationMinutes || 0) / 60);
      const minutes = (train.durationMinutes || 0) % 60;
      const durationThai = `${hours}ชม. ${minutes}นาที`;

      // Format times (remove date part, keep only HH:mm)
      const formatTime = (date: Date) => {
        const hours = date.getUTCHours().toString().padStart(2, '0');
        const minutes = date.getUTCMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
      };

      return {
        id: train.id.toString(),
        trainNumber: train.trainNumber,
        trainName: train.trainNameTh || '',
        origin: (train.originStationId || 0).toString(),
        destination: (train.destinationStationId || 0).toString(),
        departureTime: formatTime(train.departureTime),
        arrivalTime: formatTime(train.arrivalTime),
        duration: durationThai,
        stops: train.trainStops.map((stop) => (stop.stationId || 0).toString()),
        // Mock class data for now - will need to be calculated from pricing engine
        classes: [
          {
            id: 'economy',
            name: 'ชั้นประหยัด',
            price: train.trainType?.baseFare ? parseFloat(train.trainType.baseFare.toString()) : 100,
            features: ['ที่นั่งมาตรฐาน', 'ปลั๊กไฟ', 'ห้องน้ำรวม'],
            available: 50,
            totalSeats: 80,
          },
          {
            id: 'business',
            name: 'ชั้นธุรกิจ',
            price: train.trainType?.baseFare ? parseFloat(train.trainType.baseFare.toString()) * 1.5 : 150,
            features: ['ที่นั่งสบาย', 'Wi-Fi', 'ปลั๊กไฟ'],
            available: 30,
            totalSeats: 40,
          },
        ],
        amenities: [
          { id: 'wifi', name: 'Wi-Fi ฟรี', icon: '📶', available: true },
          { id: 'power', name: 'ปลั๊กไฟ', icon: '🔌', available: true },
          { id: 'ac', name: 'เครื่องปรับอากาศ', icon: '❄️', available: true },
          { id: 'toilet', name: 'ห้องน้ำ', icon: '🚻', available: true },
        ],
        operatingDays: [train.operatingDays || 'daily'],
      };
    });

    logger.info('[Train Search API] Found trains', undefined, {
      count: transformedTrains.length,
    });

    return successResponse(transformedTrains);
  } catch (error) {
    logger.error('[Train Search API] Search failed', error as Error);
    return errorResponse(
      ErrorCodes.INTERNAL_SERVER_ERROR,
      'Failed to search trains',
      500,
      { error: (error as Error).message }
    );
  }
}
