/**
 * Train Stops Reorder API
 * PUT /api/trains/:id/stops/reorder - Reorder train stops (for drag & drop)
 */

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, ErrorCodes } from '@/lib/api-response';
import { handleError } from '@/lib/error-handler';
import { logger } from '@/lib/logger';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const reorderSchema = z.object({
  stops: z.array(
    z.object({
      id: z.number().int().positive(),
      stopOrder: z.number().int().positive(),
    })
  ),
});

/**
 * PUT /api/trains/:id/stops/reorder
 * Reorder train stops (used for drag & drop functionality)
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

    logger.info(`Reordering stops for train ${trainId}`, 'Train Stops API', {
      stopCount: validatedData.stops.length,
    });

    // Check if train exists
    const train = await prisma.train.findUnique({
      where: { id: trainId },
    });

    if (!train) {
      return errorResponse(ErrorCodes.TRAIN_NOT_FOUND, 'Train not found', 404);
    }

    // Verify all stop IDs belong to this train
    const stopIds = validatedData.stops.map((s) => s.id);
    const existingStops = await prisma.trainStop.findMany({
      where: {
        id: { in: stopIds },
        trainId,
      },
    });

    if (existingStops.length !== stopIds.length) {
      return errorResponse(
        ErrorCodes.INVALID_INPUT,
        'Some stop IDs do not belong to this train',
        400
      );
    }

    // Check for duplicate stop orders
    const orders = validatedData.stops.map((s) => s.stopOrder);
    const uniqueOrders = new Set(orders);
    if (orders.length !== uniqueOrders.size) {
      return errorResponse(
        ErrorCodes.DUPLICATE_ENTRY,
        'Duplicate stop orders provided',
        400
      );
    }

    // Validate sequential ordering (1, 2, 3, ...)
    const sortedOrders = [...orders].sort((a, b) => a - b);
    for (let i = 0; i < sortedOrders.length; i++) {
      if (sortedOrders[i] !== i + 1) {
        return errorResponse(
          ErrorCodes.INVALID_INPUT,
          'Stop orders must be sequential starting from 1',
          400
        );
      }
    }

    // Use transaction to update all stops atomically
    const updatedStops = await prisma.$transaction(
      validatedData.stops.map((stop) =>
        prisma.trainStop.update({
          where: { id: stop.id },
          data: { stopOrder: stop.stopOrder },
        })
      )
    );

    // Get updated stops with station info
    const stops = await prisma.trainStop.findMany({
      where: { trainId },
      include: {
        station: {
          select: {
            id: true,
            stationCode: true,
            codeTh: true,
            codeEn: true,
            nameTh: true,
            nameEn: true,
          },
        },
      },
      orderBy: {
        stopOrder: 'asc',
      },
    });

    logger.info(`Reordered ${updatedStops.length} stops for train ${trainId}`, 'Train Stops API');

    return successResponse(
      stops,
      'Stops reordered successfully'
    );
  } catch (error) {
    logger.error(
      `Failed to reorder stops for train ${params.id}`,
      error as Error,
      'Train Stops API'
    );
    return handleError(error, 'Train Stops API');
  }
}
