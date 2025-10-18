/**
 * Train Route Distances API
 * GET /api/trains/:id/route-distances - Get all calculated distances for a train
 */

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, ErrorCodes } from '@/lib/api-response';
import { handleError } from '@/lib/error-handler';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

/**
 * GET /api/trains/:id/route-distances
 * Get all route distances for a train
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const trainId = parseInt(params.id);

    if (isNaN(trainId)) {
      return errorResponse(ErrorCodes.INVALID_INPUT, 'Invalid train ID', 400);
    }

    logger.info(`Fetching route distances for train ${trainId}`, 'Route Distances API');

    // Check if train exists
    const train = await prisma.train.findUnique({
      where: { id: trainId },
      select: { id: true, trainNumber: true, trainNameTh: true },
    });

    if (!train) {
      return errorResponse(ErrorCodes.TRAIN_NOT_FOUND, 'Train not found', 404);
    }

    // Get all route distances
    const distances = await prisma.routeDistance.findMany({
      where: { trainId },
      include: {
        fromStation: {
          select: {
            id: true,
            stationCode: true,
            nameTh: true,
            nameEn: true,
          },
        },
        toStation: {
          select: {
            id: true,
            stationCode: true,
            nameTh: true,
            nameEn: true,
          },
        },
      },
      orderBy: [{ fromStationId: 'asc' }, { toStationId: 'asc' }],
    });

    logger.info(
      `Retrieved ${distances.length} route distances for train ${trainId}`,
      'Route Distances API'
    );

    return successResponse(
      distances,
      'Route distances retrieved successfully'
    );
  } catch (error) {
    logger.error(
      `Failed to fetch route distances for train ${params.id}`,
      error as Error,
      'Route Distances API'
    );
    return handleError(error, 'Route Distances API');
  }
}
