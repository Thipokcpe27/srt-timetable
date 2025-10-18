/**
 * Train Types API Endpoint
 * GET /api/train-types - List all train types
 */

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse } from '@/lib/api-response';
import { handleError } from '@/lib/error-handler';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

/**
 * GET /api/train-types
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get('active') === 'false' ? false : true;

    logger.info('Fetching train types', 'TrainTypes API');

    const trainTypes = await prisma.trainType.findMany({
      where: {
        isActive,
      },
      orderBy: {
        sortOrder: 'asc',
      },
    });

    logger.info('Train types fetched successfully', 'TrainTypes API', {
      count: trainTypes.length,
    });

    return successResponse(trainTypes, 'Train types retrieved successfully');
  } catch (error) {
    logger.error('Failed to fetch train types', error as Error, 'TrainTypes API');
    return handleError(error, 'TrainTypes API');
  }
}
