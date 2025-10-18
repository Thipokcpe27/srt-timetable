/**
 * Individual Train Composition Management API
 * GET /api/trains/:id/compositions/:compositionId - Get specific composition
 * PUT /api/trains/:id/compositions/:compositionId - Update composition
 * DELETE /api/trains/:id/compositions/:compositionId - Delete composition
 */

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, ErrorCodes } from '@/lib/api-response';
import { handleError } from '@/lib/error-handler';
import { logger } from '@/lib/logger';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const updateCompositionSchema = z.object({
  quantity: z.number().int().positive().optional(),
  sortOrder: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
  notes: z.string().optional().nullable(),
});

/**
 * GET /api/trains/:id/compositions/:compositionId
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; compositionId: string } }
) {
  try {
    const trainId = parseInt(params.id);
    const compositionId = parseInt(params.compositionId);

    if (isNaN(trainId) || isNaN(compositionId)) {
      return errorResponse(ErrorCodes.INVALID_INPUT, 'Invalid train ID or composition ID', 400);
    }

    logger.info(
      `Fetching composition ${compositionId} for train ${trainId}`,
      'Train Compositions API'
    );

    const composition = await prisma.trainComposition.findFirst({
      where: {
        id: compositionId,
        trainId,
      },
      include: {
        bogie: true,
      },
    });

    if (!composition) {
      return errorResponse(ErrorCodes.COMPOSITION_NOT_FOUND, 'Composition not found', 404);
    }

    return successResponse(composition, 'Composition retrieved successfully');
  } catch (error) {
    logger.error(
      `Failed to fetch composition ${params.compositionId} for train ${params.id}`,
      error as Error,
      'Train Compositions API'
    );
    return handleError(error, 'Train Compositions API');
  }
}

/**
 * PUT /api/trains/:id/compositions/:compositionId
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; compositionId: string } }
) {
  try {
    const trainId = parseInt(params.id);
    const compositionId = parseInt(params.compositionId);

    if (isNaN(trainId) || isNaN(compositionId)) {
      return errorResponse(ErrorCodes.INVALID_INPUT, 'Invalid train ID or composition ID', 400);
    }

    const body = await request.json();
    const validatedData = updateCompositionSchema.parse(body);

    logger.info(
      `Updating composition ${compositionId} for train ${trainId}`,
      'Train Compositions API',
      { data: validatedData }
    );

    // Check if composition exists
    const existingComposition = await prisma.trainComposition.findFirst({
      where: {
        id: compositionId,
        trainId,
      },
    });

    if (!existingComposition) {
      return errorResponse(ErrorCodes.COMPOSITION_NOT_FOUND, 'Composition not found', 404);
    }

    // Update composition
    const updatedComposition = await prisma.trainComposition.update({
      where: { id: compositionId },
      data: validatedData,
      include: {
        bogie: true,
      },
    });

    logger.info(`Composition ${compositionId} updated successfully`, 'Train Compositions API');

    return successResponse(updatedComposition, 'Composition updated successfully');
  } catch (error) {
    logger.error(
      `Failed to update composition ${params.compositionId} for train ${params.id}`,
      error as Error,
      'Train Compositions API'
    );
    return handleError(error, 'Train Compositions API');
  }
}

/**
 * DELETE /api/trains/:id/compositions/:compositionId
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; compositionId: string } }
) {
  try {
    const trainId = parseInt(params.id);
    const compositionId = parseInt(params.compositionId);

    if (isNaN(trainId) || isNaN(compositionId)) {
      return errorResponse(ErrorCodes.INVALID_INPUT, 'Invalid train ID or composition ID', 400);
    }

    logger.info(
      `Deleting composition ${compositionId} for train ${trainId}`,
      'Train Compositions API'
    );

    // Check if composition exists
    const existingComposition = await prisma.trainComposition.findFirst({
      where: {
        id: compositionId,
        trainId,
      },
    });

    if (!existingComposition) {
      return errorResponse(ErrorCodes.COMPOSITION_NOT_FOUND, 'Composition not found', 404);
    }

    await prisma.trainComposition.delete({
      where: { id: compositionId },
    });

    logger.info(`Composition ${compositionId} deleted successfully`, 'Train Compositions API');

    return successResponse({ id: compositionId }, 'Composition deleted successfully');
  } catch (error) {
    logger.error(
      `Failed to delete composition ${params.compositionId} for train ${params.id}`,
      error as Error,
      'Train Compositions API'
    );
    return handleError(error, 'Train Compositions API');
  }
}
