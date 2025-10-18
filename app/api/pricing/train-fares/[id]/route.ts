/**
 * Individual Train Fare Management API
 * GET /api/pricing/train-fares/:id - Get train fare by ID
 * PUT /api/pricing/train-fares/:id - Update train fare
 * DELETE /api/pricing/train-fares/:id - Delete train fare
 */

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, ErrorCodes } from '@/lib/api-response';
import { handleError } from '@/lib/error-handler';
import { logger } from '@/lib/logger';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const updateTrainFareSchema = z.object({
  trainTypeId: z.number().int().positive().optional(),
  classNumber: z.number().int().min(1).max(3).optional(),
  fareTh: z.string().max(100).optional(),
  fareEn: z.string().max(100).optional().nullable(),
  fareValue: z.number().positive().optional(),
  isActive: z.boolean().optional(),
  notes: z.string().optional().nullable(),
});

/**
 * GET /api/pricing/train-fares/:id
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return errorResponse(ErrorCodes.INVALID_INPUT, 'Invalid train fare ID', 400);
    }

    logger.info(`Fetching train fare ${id}`, 'Train Fares API');

    const trainFare = await prisma.trainFare.findUnique({
      where: { id },
      include: {
        trainType: {
          select: {
            id: true,
            code: true,
            nameTh: true,
            nameEn: true,
            baseFare: true,
          },
        },
      },
    });

    if (!trainFare) {
      return errorResponse(ErrorCodes.TRAIN_FARE_NOT_FOUND, 'Train fare not found', 404);
    }

    logger.info(`Train fare ${id} retrieved`, 'Train Fares API');

    return successResponse(trainFare, 'Train fare retrieved successfully');
  } catch (error) {
    logger.error(`Failed to fetch train fare ${params.id}`, error as Error, 'Train Fares API');
    return handleError(error, 'Train Fares API');
  }
}

/**
 * PUT /api/pricing/train-fares/:id
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return errorResponse(ErrorCodes.INVALID_INPUT, 'Invalid train fare ID', 400);
    }

    const body = await request.json();
    const validatedData = updateTrainFareSchema.parse(body);

    logger.info(`Updating train fare ${id}`, 'Train Fares API', { data: validatedData });

    // Check if train fare exists
    const existingFare = await prisma.trainFare.findUnique({
      where: { id },
    });

    if (!existingFare) {
      return errorResponse(ErrorCodes.TRAIN_FARE_NOT_FOUND, 'Train fare not found', 404);
    }

    // If updating trainTypeId or classNumber, check if new train type exists
    if (validatedData.trainTypeId) {
      const trainType = await prisma.trainType.findUnique({
        where: { id: validatedData.trainTypeId },
      });

      if (!trainType) {
        return errorResponse(ErrorCodes.TRAIN_TYPE_NOT_FOUND, 'Train type not found', 404);
      }
    }

    // Check for conflicts if updating trainTypeId or classNumber
    if (validatedData.trainTypeId || validatedData.classNumber) {
      const newTrainTypeId = validatedData.trainTypeId ?? existingFare.trainTypeId;
      const newClassNumber = validatedData.classNumber ?? existingFare.classNumber;

      // Only check for conflict if the combination has changed
      if (
        newTrainTypeId !== existingFare.trainTypeId ||
        newClassNumber !== existingFare.classNumber
      ) {
        const conflict = await prisma.trainFare.findUnique({
          where: {
            trainTypeId_classNumber: {
              trainTypeId: newTrainTypeId,
              classNumber: newClassNumber,
            },
          },
        });

        if (conflict) {
          return errorResponse(
            ErrorCodes.DUPLICATE_ENTRY,
            'Train fare for this train type and class already exists',
            409
          );
        }
      }
    }

    // Update train fare
    const updatedFare = await prisma.trainFare.update({
      where: { id },
      data: validatedData,
      include: {
        trainType: {
          select: {
            id: true,
            code: true,
            nameTh: true,
            nameEn: true,
          },
        },
      },
    });

    logger.info(`Train fare ${id} updated successfully`, 'Train Fares API');

    return successResponse(updatedFare, 'Train fare updated successfully');
  } catch (error) {
    logger.error(`Failed to update train fare ${params.id}`, error as Error, 'Train Fares API');
    return handleError(error, 'Train Fares API');
  }
}

/**
 * DELETE /api/pricing/train-fares/:id
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return errorResponse(ErrorCodes.INVALID_INPUT, 'Invalid train fare ID', 400);
    }

    logger.info(`Deleting train fare ${id}`, 'Train Fares API');

    // Check if train fare exists
    const existingFare = await prisma.trainFare.findUnique({
      where: { id },
    });

    if (!existingFare) {
      return errorResponse(ErrorCodes.TRAIN_FARE_NOT_FOUND, 'Train fare not found', 404);
    }

    // Delete train fare
    await prisma.trainFare.delete({
      where: { id },
    });

    logger.info(`Train fare ${id} deleted successfully`, 'Train Fares API');

    return successResponse({ id }, 'Train fare deleted successfully');
  } catch (error) {
    logger.error(`Failed to delete train fare ${params.id}`, error as Error, 'Train Fares API');
    return handleError(error, 'Train Fares API');
  }
}
