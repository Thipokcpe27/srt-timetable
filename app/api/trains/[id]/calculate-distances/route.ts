/**
 * Train Route Distance Calculator API
 * POST /api/trains/:id/calculate-distances - Calculate and save distances for a train
 */

import { NextRequest } from 'next/server';
import { successResponse, errorResponse, ErrorCodes } from '@/lib/api-response';
import { handleError } from '@/lib/error-handler';
import { logger } from '@/lib/logger';
import { calculateAndSaveTrainDistances } from '@/lib/route-distance-calculator';

export const dynamic = 'force-dynamic';

/**
 * POST /api/trains/:id/calculate-distances
 * Calculate and save route distances for a train
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const trainId = parseInt(params.id);

    if (isNaN(trainId)) {
      return errorResponse(ErrorCodes.INVALID_INPUT, 'Invalid train ID', 400);
    }

    logger.info(
      `Calculating route distances for train ${trainId}`,
      'Route Distance Calculator API'
    );

    const result = await calculateAndSaveTrainDistances(trainId);

    logger.info(
      `Successfully calculated ${result.calculated} and saved ${result.saved} distances for train ${trainId}`,
      'Route Distance Calculator API'
    );

    return successResponse(
      {
        trainId,
        calculated: result.calculated,
        saved: result.saved,
      },
      'Route distances calculated and saved successfully'
    );
  } catch (error) {
    logger.error(
      `Failed to calculate distances for train ${params.id}`,
      error as Error,
      'Route Distance Calculator API'
    );
    return handleError(error, 'Route Distance Calculator API');
  }
}
