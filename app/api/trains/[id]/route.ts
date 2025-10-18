/**
 * Train Detail API
 * GET /api/trains/:id - Get train by ID
 * PUT /api/trains/:id - Update train
 * DELETE /api/trains/:id - Delete train
 */

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, ErrorCodes } from '@/lib/api-response';
import { handleError } from '@/lib/error-handler';
import { logger } from '@/lib/logger';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const updateTrainSchema = z.object({
  trainNumber: z.string().max(20).optional(),
  trainNameTh: z.string().max(255).optional(),
  trainNameEn: z.string().max(255).optional(),
  trainNameCn: z.string().max(255).optional(),
  trainTypeId: z.number().int().positive().optional(),
  originStationId: z.number().int().positive().optional(),
  destinationStationId: z.number().int().positive().optional(),
  departureTime: z.string().optional(),
  arrivalTime: z.string().optional(),
  durationMinutes: z.number().int().positive().optional(),
  operatingDays: z.string().optional(),
  runningOrder: z.number().int().optional(),
  serviceZone: z.string().max(100).optional(),
  totalDistanceKm: z.number().optional(),
  isActive: z.boolean().optional(),
  notes: z.string().optional(),
});

/**
 * GET /api/trains/:id
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return errorResponse(ErrorCodes.INVALID_INPUT, 'Invalid train ID', 400);
    }

    logger.info(`Fetching train ${id}`, 'Train API');

    const train = await prisma.train.findUnique({
      where: { id },
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
    });

    if (!train) {
      return errorResponse(ErrorCodes.TRAIN_NOT_FOUND, 'Train not found', 404);
    }

    logger.info(`Train ${id} retrieved`, 'Train API');

    return successResponse(train, 'Train retrieved successfully');
  } catch (error) {
    logger.error(`Failed to fetch train ${params.id}`, error as Error, 'Train API');
    return handleError(error, 'Train API');
  }
}

/**
 * PUT /api/trains/:id
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return errorResponse(ErrorCodes.INVALID_INPUT, 'Invalid train ID', 400);
    }

    const body = await request.json();
    const validatedData = updateTrainSchema.parse(body);

    logger.info(`Updating train ${id}`, 'Train API', { data: validatedData });

    const existingTrain = await prisma.train.findUnique({
      where: { id },
    });

    if (!existingTrain) {
      return errorResponse(ErrorCodes.TRAIN_NOT_FOUND, 'Train not found', 404);
    }

    const updateData: any = { ...validatedData };

    if (validatedData.departureTime) {
      updateData.departureTime = new Date(`2024-01-01T${validatedData.departureTime}:00`);
    }
    if (validatedData.arrivalTime) {
      updateData.arrivalTime = new Date(`2024-01-01T${validatedData.arrivalTime}:00`);
    }

    const updatedTrain = await prisma.train.update({
      where: { id },
      data: updateData,
      include: {
        trainType: true,
        originStation: true,
        destinationStation: true,
      },
    });

    logger.info(`Train ${id} updated successfully`, 'Train API');

    return successResponse(updatedTrain, 'Train updated successfully');
  } catch (error) {
    logger.error(`Failed to update train ${params.id}`, error as Error, 'Train API');
    return handleError(error, 'Train API');
  }
}

/**
 * DELETE /api/trains/:id
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return errorResponse(ErrorCodes.INVALID_INPUT, 'Invalid train ID', 400);
    }

    logger.info(`Deleting train ${id}`, 'Train API');

    const existingTrain = await prisma.train.findUnique({
      where: { id },
    });

    if (!existingTrain) {
      return errorResponse(ErrorCodes.TRAIN_NOT_FOUND, 'Train not found', 404);
    }

    await prisma.train.delete({
      where: { id },
    });

    logger.info(`Train ${id} deleted successfully`, 'Train API');

    return successResponse({ id }, 'Train deleted successfully');
  } catch (error) {
    logger.error(`Failed to delete train ${params.id}`, error as Error, 'Train API');
    return handleError(error, 'Train API');
  }
}
