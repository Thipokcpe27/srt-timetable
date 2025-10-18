/**
 * Route Distances Query API
 * GET /api/route-distances - Query distance between stations on a specific train
 */

import { NextRequest } from 'next/server';
import { successResponse, errorResponse, ErrorCodes } from '@/lib/api-response';
import { handleError } from '@/lib/error-handler';
import { logger } from '@/lib/logger';
import { getRouteDistance } from '@/lib/route-distance-calculator';

export const dynamic = 'force-dynamic';

/**
 * GET /api/route-distances?trainId=1&fromStationId=1&toStationId=5
 * Query distance between two stations on a specific train route
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const trainId = searchParams.get('trainId');
    const fromStationId = searchParams.get('fromStationId');
    const toStationId = searchParams.get('toStationId');

    // Validate required parameters
    if (!trainId || !fromStationId || !toStationId) {
      return errorResponse(
        ErrorCodes.INVALID_INPUT,
        'Missing required parameters: trainId, fromStationId, toStationId',
        400
      );
    }

    const trainIdNum = parseInt(trainId);
    const fromStationIdNum = parseInt(fromStationId);
    const toStationIdNum = parseInt(toStationId);

    if (isNaN(trainIdNum) || isNaN(fromStationIdNum) || isNaN(toStationIdNum)) {
      return errorResponse(ErrorCodes.INVALID_INPUT, 'Invalid ID format', 400);
    }

    if (fromStationIdNum === toStationIdNum) {
      return errorResponse(
        ErrorCodes.INVALID_INPUT,
        'fromStationId and toStationId must be different',
        400
      );
    }

    logger.info(
      `Querying distance for train ${trainIdNum} from station ${fromStationIdNum} to ${toStationIdNum}`,
      'Route Distance Query API'
    );

    const distance = await getRouteDistance(trainIdNum, fromStationIdNum, toStationIdNum);

    if (!distance) {
      return errorResponse(
        ErrorCodes.RESOURCE_NOT_FOUND,
        'Distance not found for the specified route. The stations may not be on this train route.',
        404
      );
    }

    logger.info(
      `Found distance: ${distance.distanceKm} km`,
      'Route Distance Query API'
    );

    return successResponse(
      distance,
      'Distance retrieved successfully'
    );
  } catch (error) {
    logger.error('Failed to query route distance', error as Error, 'Route Distance Query API');
    return handleError(error, 'Route Distance Query API');
  }
}
