/**
 * Batch Route Distance Calculator API
 * POST /api/route-distances/batch-calculate - Calculate distances for all active trains
 */

import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/api-response';
import { handleError } from '@/lib/error-handler';
import { logger } from '@/lib/logger';
import { calculateAllTrainDistances } from '@/lib/route-distance-calculator';

export const dynamic = 'force-dynamic';

/**
 * POST /api/route-distances/batch-calculate
 * Calculate and save route distances for all active trains
 * WARNING: This is a long-running operation
 */
export async function POST(request: NextRequest) {
  try {
    logger.info('Starting batch calculation for all trains', 'Batch Calculator API');

    const result = await calculateAllTrainDistances();

    const hasErrors = result.errors.length > 0;

    logger.info(
      `Batch calculation complete: ${result.processed} trains, ${result.totalDistances} distances, ${result.errors.length} errors`,
      'Batch Calculator API'
    );

    return successResponse(
      {
        processed: result.processed,
        totalDistances: result.totalDistances,
        errors: result.errors,
        status: hasErrors ? 'completed_with_errors' : 'success',
      },
      hasErrors
        ? 'Batch calculation completed with some errors'
        : 'Batch calculation completed successfully',
      null,
      hasErrors ? 207 : 200 // 207 Multi-Status for partial success
    );
  } catch (error) {
    logger.error('Failed to run batch calculation', error as Error, 'Batch Calculator API');
    return handleError(error, 'Batch Calculator API');
  }
}
