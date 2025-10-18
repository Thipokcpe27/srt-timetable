/**
 * Train Compositions Management API
 * GET /api/trains/:id/compositions - Get all bogies for a train
 * POST /api/trains/:id/compositions - Add a bogie to a train
 */

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, ErrorCodes } from '@/lib/api-response';
import { handleError } from '@/lib/error-handler';
import { logger } from '@/lib/logger';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const createCompositionSchema = z.object({
  bogieId: z.number().int().positive(),
  quantity: z.number().int().positive().optional(),
  sortOrder: z.number().int().min(0).optional().nullable(),
  isActive: z.boolean().optional(),
  notes: z.string().optional().nullable(),
});

/**
 * GET /api/trains/:id/compositions
 * Get all bogies attached to a train
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const trainId = parseInt(params.id);

    if (isNaN(trainId)) {
      return errorResponse(ErrorCodes.INVALID_INPUT, 'Invalid train ID', 400);
    }

    logger.info(`Fetching compositions for train ${trainId}`, 'Train Compositions API');

    // Check if train exists
    const train = await prisma.train.findUnique({
      where: { id: trainId },
    });

    if (!train) {
      return errorResponse(ErrorCodes.TRAIN_NOT_FOUND, 'Train not found', 404);
    }

    // Get all compositions for this train
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
            shortNameEn: true,
            classNumber: true,
            bogieClass: true,
            hasAC: true,
            isSleeper: true,
            totalSeats: true,
            upperBerths: true,
            lowerBerths: true,
          },
        },
      },
      orderBy: {
        sortOrder: 'asc',
      },
    });

    // Calculate total seats
    const totalSeats = compositions.reduce((sum, comp) => {
      const seats = comp.bogie.totalSeats || 0;
      return sum + (seats * comp.quantity);
    }, 0);

    logger.info(
      `Retrieved ${compositions.length} compositions for train ${trainId}`,
      'Train Compositions API',
      { totalSeats }
    );

    return successResponse(
      compositions,
      `Retrieved ${compositions.length} compositions successfully`
    );
  } catch (error) {
    logger.error(
      `Failed to fetch compositions for train ${params.id}`,
      error as Error,
      'Train Compositions API'
    );
    return handleError(error, 'Train Compositions API');
  }
}

/**
 * POST /api/trains/:id/compositions
 * Add a bogie to a train
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

    const body = await request.json();
    const validatedData = createCompositionSchema.parse(body);

    logger.info(`Adding bogie to train ${trainId}`, 'Train Compositions API', {
      data: validatedData,
    });

    // Check if train exists
    const train = await prisma.train.findUnique({
      where: { id: trainId },
    });

    if (!train) {
      return errorResponse(ErrorCodes.TRAIN_NOT_FOUND, 'Train not found', 404);
    }

    // Check if bogie exists
    const bogie = await prisma.bogie.findUnique({
      where: { id: validatedData.bogieId },
    });

    if (!bogie) {
      return errorResponse(ErrorCodes.BOGIE_NOT_FOUND, 'Bogie not found', 404);
    }

    // Check if composition already exists
    const existingComposition = await prisma.trainComposition.findUnique({
      where: {
        trainId_bogieId: {
          trainId,
          bogieId: validatedData.bogieId,
        },
      },
    });

    if (existingComposition) {
      return errorResponse(
        ErrorCodes.DUPLICATE_ENTRY,
        'This bogie is already attached to this train',
        409
      );
    }

    // If sortOrder not provided, use max + 1
    let sortOrder = validatedData.sortOrder;
    if (sortOrder === null || sortOrder === undefined) {
      const maxOrder = await prisma.trainComposition.findFirst({
        where: { trainId },
        orderBy: { sortOrder: 'desc' },
        select: { sortOrder: true },
      });
      sortOrder = (maxOrder?.sortOrder ?? -1) + 1;
    }

    // Create composition
    const newComposition = await prisma.trainComposition.create({
      data: {
        trainId,
        bogieId: validatedData.bogieId,
        quantity: validatedData.quantity ?? 1,
        sortOrder,
        isActive: validatedData.isActive ?? true,
        notes: validatedData.notes,
      },
      include: {
        bogie: true,
      },
    });

    logger.info(`Bogie added to train ${trainId}`, 'Train Compositions API', {
      compositionId: newComposition.id,
    });

    return successResponse(newComposition, 'Bogie added to train successfully', null, 201);
  } catch (error) {
    logger.error(
      `Failed to add bogie to train ${params.id}`,
      error as Error,
      'Train Compositions API'
    );
    return handleError(error, 'Train Compositions API');
  }
}
