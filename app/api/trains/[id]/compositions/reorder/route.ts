/**
 * Train Compositions Reorder API
 * PUT /api/trains/:id/compositions/reorder - Reorder train compositions (for drag & drop)
 */

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, ErrorCodes } from '@/lib/api-response';
import { handleError } from '@/lib/error-handler';
import { logger } from '@/lib/logger';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const reorderSchema = z.object({
  compositions: z.array(
    z.object({
      id: z.number().int().positive(),
      sortOrder: z.number().int().min(0),
    })
  ),
});

/**
 * PUT /api/trains/:id/compositions/reorder
 * Reorder train compositions (used for drag & drop functionality)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const trainId = parseInt(params.id);

    if (isNaN(trainId)) {
      return errorResponse(ErrorCodes.INVALID_INPUT, 'Invalid train ID', 400);
    }

    const body = await request.json();
    const validatedData = reorderSchema.parse(body);

    logger.info(`Reordering compositions for train ${trainId}`, 'Train Compositions API', {
      count: validatedData.compositions.length,
    });

    // Check if train exists
    const train = await prisma.train.findUnique({
      where: { id: trainId },
    });

    if (!train) {
      return errorResponse(ErrorCodes.TRAIN_NOT_FOUND, 'Train not found', 404);
    }

    // Verify all composition IDs belong to this train
    const compositionIds = validatedData.compositions.map((c) => c.id);
    const existingCompositions = await prisma.trainComposition.findMany({
      where: {
        id: { in: compositionIds },
        trainId,
      },
    });

    if (existingCompositions.length !== compositionIds.length) {
      return errorResponse(
        ErrorCodes.INVALID_INPUT,
        'Some composition IDs do not belong to this train',
        400
      );
    }

    // Check for duplicate sort orders
    const orders = validatedData.compositions.map((c) => c.sortOrder);
    const uniqueOrders = new Set(orders);
    if (orders.length !== uniqueOrders.size) {
      return errorResponse(
        ErrorCodes.DUPLICATE_ENTRY,
        'Duplicate sort orders provided',
        400
      );
    }

    // Validate sequential ordering (0, 1, 2, ...)
    const sortedOrders = [...orders].sort((a, b) => a - b);
    for (let i = 0; i < sortedOrders.length; i++) {
      if (sortedOrders[i] !== i) {
        return errorResponse(
          ErrorCodes.INVALID_INPUT,
          'Sort orders must be sequential starting from 0',
          400
        );
      }
    }

    // Use transaction to update all compositions atomically
    const updatedCompositions = await prisma.$transaction(
      validatedData.compositions.map((comp) =>
        prisma.trainComposition.update({
          where: { id: comp.id },
          data: { sortOrder: comp.sortOrder },
        })
      )
    );

    // Get updated compositions with bogie info
    const compositions = await prisma.trainComposition.findMany({
      where: { trainId },
      include: {
        bogie: {
          select: {
            id: true,
            code: true,
            nameTh: true,
            nameEn: true,
            shortNameTh: true,
            classNumber: true,
            totalSeats: true,
          },
        },
      },
      orderBy: {
        sortOrder: 'asc',
      },
    });

    logger.info(
      `Reordered ${updatedCompositions.length} compositions for train ${trainId}`,
      'Train Compositions API'
    );

    return successResponse(
      compositions,
      'Compositions reordered successfully'
    );
  } catch (error) {
    logger.error(
      `Failed to reorder compositions for train ${params.id}`,
      error as Error,
      'Train Compositions API'
    );
    return handleError(error, 'Train Compositions API');
  }
}
