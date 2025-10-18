/**
 * Individual Train Stop Management API
 * GET /api/trains/:id/stops/:stopId - Get specific stop
 * PUT /api/trains/:id/stops/:stopId - Update stop
 * DELETE /api/trains/:id/stops/:stopId - Delete stop
 */

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, ErrorCodes } from '@/lib/api-response';
import { handleError } from '@/lib/error-handler';
import { logger } from '@/lib/logger';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const updateStopSchema = z.object({
  stopOrder: z.number().int().positive().optional(),
  arrivalTime: z.string().optional().nullable(),
  departureTime: z.string().optional().nullable(),
  waitTimeMinutes: z.number().int().min(0).optional().nullable(),
  platformNumber: z.string().max(20).optional().nullable(),
  distanceFromOrigin: z.number().min(0).optional().nullable(),
  isActive: z.boolean().optional(),
  notes: z.string().optional().nullable(),
});

/**
 * GET /api/trains/:id/stops/:stopId
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; stopId: string } }
) {
  try {
    const trainId = parseInt(params.id);
    const stopId = parseInt(params.stopId);

    if (isNaN(trainId) || isNaN(stopId)) {
      return errorResponse(ErrorCodes.INVALID_INPUT, 'Invalid train ID or stop ID', 400);
    }

    logger.info(`Fetching stop ${stopId} for train ${trainId}`, 'Train Stops API');

    const stop = await prisma.trainStop.findFirst({
      where: {
        id: stopId,
        trainId,
      },
      include: {
        station: true,
      },
    });

    if (!stop) {
      return errorResponse(ErrorCodes.TRAIN_STOP_NOT_FOUND, 'Stop not found', 404);
    }

    return successResponse(stop, 'Stop retrieved successfully');
  } catch (error) {
    logger.error(
      `Failed to fetch stop ${params.stopId} for train ${params.id}`,
      error as Error,
      'Train Stops API'
    );
    return handleError(error, 'Train Stops API');
  }
}

/**
 * PUT /api/trains/:id/stops/:stopId
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; stopId: string } }
) {
  try {
    const trainId = parseInt(params.id);
    const stopId = parseInt(params.stopId);

    if (isNaN(trainId) || isNaN(stopId)) {
      return errorResponse(ErrorCodes.INVALID_INPUT, 'Invalid train ID or stop ID', 400);
    }

    const body = await request.json();
    const validatedData = updateStopSchema.parse(body);

    logger.info(`Updating stop ${stopId} for train ${trainId}`, 'Train Stops API', {
      data: validatedData,
    });

    // Check if stop exists
    const existingStop = await prisma.trainStop.findFirst({
      where: {
        id: stopId,
        trainId,
      },
    });

    if (!existingStop) {
      return errorResponse(ErrorCodes.TRAIN_STOP_NOT_FOUND, 'Stop not found', 404);
    }

    // If updating stopOrder, check for conflicts
    if (validatedData.stopOrder && validatedData.stopOrder !== existingStop.stopOrder) {
      const orderConflict = await prisma.trainStop.findFirst({
        where: {
          trainId,
          stopOrder: validatedData.stopOrder,
          id: { not: stopId },
        },
      });

      if (orderConflict) {
        return errorResponse(
          ErrorCodes.DUPLICATE_ENTRY,
          'Stop order already exists. Use reorder endpoint to change order.',
          409
        );
      }
    }

    // Prepare update data
    const updateData: any = { ...validatedData };

    if (validatedData.arrivalTime !== undefined) {
      updateData.arrivalTime = validatedData.arrivalTime
        ? new Date(`2024-01-01T${validatedData.arrivalTime}:00`)
        : null;
    }
    if (validatedData.departureTime !== undefined) {
      updateData.departureTime = validatedData.departureTime
        ? new Date(`2024-01-01T${validatedData.departureTime}:00`)
        : null;
    }

    const updatedStop = await prisma.trainStop.update({
      where: { id: stopId },
      data: updateData,
      include: {
        station: true,
      },
    });

    logger.info(`Stop ${stopId} updated successfully`, 'Train Stops API');

    return successResponse(updatedStop, 'Stop updated successfully');
  } catch (error) {
    logger.error(
      `Failed to update stop ${params.stopId} for train ${params.id}`,
      error as Error,
      'Train Stops API'
    );
    return handleError(error, 'Train Stops API');
  }
}

/**
 * DELETE /api/trains/:id/stops/:stopId
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; stopId: string } }
) {
  try {
    const trainId = parseInt(params.id);
    const stopId = parseInt(params.stopId);

    if (isNaN(trainId) || isNaN(stopId)) {
      return errorResponse(ErrorCodes.INVALID_INPUT, 'Invalid train ID or stop ID', 400);
    }

    logger.info(`Deleting stop ${stopId} for train ${trainId}`, 'Train Stops API');

    // Check if stop exists
    const existingStop = await prisma.trainStop.findFirst({
      where: {
        id: stopId,
        trainId,
      },
    });

    if (!existingStop) {
      return errorResponse(ErrorCodes.TRAIN_STOP_NOT_FOUND, 'Stop not found', 404);
    }

    await prisma.trainStop.delete({
      where: { id: stopId },
    });

    logger.info(`Stop ${stopId} deleted successfully`, 'Train Stops API');

    return successResponse({ id: stopId }, 'Stop deleted successfully');
  } catch (error) {
    logger.error(
      `Failed to delete stop ${params.stopId} for train ${params.id}`,
      error as Error,
      'Train Stops API'
    );
    return handleError(error, 'Train Stops API');
  }
}
