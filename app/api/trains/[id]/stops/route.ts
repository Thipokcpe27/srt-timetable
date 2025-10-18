/**
 * Train Stops Management API
 * GET /api/trains/:id/stops - Get all stops for a train
 * POST /api/trains/:id/stops - Add a stop to a train
 */

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, ErrorCodes } from '@/lib/api-response';
import { handleError } from '@/lib/error-handler';
import { logger } from '@/lib/logger';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const createStopSchema = z.object({
  stationId: z.number().int().positive(),
  stopOrder: z.number().int().positive(),
  arrivalTime: z.string().optional().nullable(),
  departureTime: z.string().optional().nullable(),
  waitTimeMinutes: z.number().int().min(0).optional().nullable(),
  platformNumber: z.string().max(20).optional().nullable(),
  distanceFromOrigin: z.number().min(0).optional().nullable(),
  isActive: z.boolean().optional(),
  notes: z.string().optional().nullable(),
});

/**
 * GET /api/trains/:id/stops
 * Get all stops for a specific train
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

    logger.info(`Fetching stops for train ${trainId}`, 'Train Stops API');

    // Check if train exists
    const train = await prisma.train.findUnique({
      where: { id: trainId },
    });

    if (!train) {
      return errorResponse(ErrorCodes.TRAIN_NOT_FOUND, 'Train not found', 404);
    }

    // Get all stops for this train
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
            distanceForPricing: true,
            distanceActual: true,
          },
        },
      },
      orderBy: {
        stopOrder: 'asc',
      },
    });

    logger.info(`Retrieved ${stops.length} stops for train ${trainId}`, 'Train Stops API');

    return successResponse(
      stops,
      `Retrieved ${stops.length} stops successfully`
    );
  } catch (error) {
    logger.error(`Failed to fetch stops for train ${params.id}`, error as Error, 'Train Stops API');
    return handleError(error, 'Train Stops API');
  }
}

/**
 * POST /api/trains/:id/stops
 * Add a new stop to a train
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
    const validatedData = createStopSchema.parse(body);

    logger.info(`Adding stop to train ${trainId}`, 'Train Stops API', { data: validatedData });

    // Check if train exists
    const train = await prisma.train.findUnique({
      where: { id: trainId },
    });

    if (!train) {
      return errorResponse(ErrorCodes.TRAIN_NOT_FOUND, 'Train not found', 404);
    }

    // Check if station exists
    const station = await prisma.station.findUnique({
      where: { id: validatedData.stationId },
    });

    if (!station) {
      return errorResponse(ErrorCodes.STATION_NOT_FOUND, 'Station not found', 404);
    }

    // Check if stop already exists for this train and station
    const existingStop = await prisma.trainStop.findUnique({
      where: {
        trainId_stationId: {
          trainId,
          stationId: validatedData.stationId,
        },
      },
    });

    if (existingStop) {
      return errorResponse(
        ErrorCodes.DUPLICATE_ENTRY,
        'This station is already a stop for this train',
        409
      );
    }

    // Check if stopOrder already exists
    const orderExists = await prisma.trainStop.findFirst({
      where: {
        trainId,
        stopOrder: validatedData.stopOrder,
      },
    });

    if (orderExists) {
      return errorResponse(
        ErrorCodes.DUPLICATE_ENTRY,
        'Stop order already exists. Use reorder endpoint to change order.',
        409
      );
    }

    // Parse times if provided
    const createData: any = {
      trainId,
      stationId: validatedData.stationId,
      stopOrder: validatedData.stopOrder,
      waitTimeMinutes: validatedData.waitTimeMinutes,
      platformNumber: validatedData.platformNumber,
      distanceFromOrigin: validatedData.distanceFromOrigin,
      isActive: validatedData.isActive ?? true,
      notes: validatedData.notes,
    };

    if (validatedData.arrivalTime) {
      createData.arrivalTime = new Date(`2024-01-01T${validatedData.arrivalTime}:00`);
    }
    if (validatedData.departureTime) {
      createData.departureTime = new Date(`2024-01-01T${validatedData.departureTime}:00`);
    }

    const newStop = await prisma.trainStop.create({
      data: createData,
      include: {
        station: true,
      },
    });

    logger.info(`Stop added to train ${trainId}`, 'Train Stops API', { stopId: newStop.id });

    return successResponse(newStop, 'Stop added successfully', null, 201);
  } catch (error) {
    logger.error(`Failed to add stop to train ${params.id}`, error as Error, 'Train Stops API');
    return handleError(error, 'Train Stops API');
  }
}
