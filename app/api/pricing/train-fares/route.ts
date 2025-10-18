/**
 * Train Fares Management API
 * GET /api/pricing/train-fares - List all train fares
 * POST /api/pricing/train-fares - Create new train fare
 */

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, ErrorCodes } from '@/lib/api-response';
import { handleError } from '@/lib/error-handler';
import { logger } from '@/lib/logger';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const createTrainFareSchema = z.object({
  trainTypeId: z.number().int().positive(),
  classNumber: z.number().int().min(1).max(3),
  fareTh: z.string().max(100),
  fareEn: z.string().max(100).optional().nullable(),
  fareValue: z.number().positive(),
  isActive: z.boolean().optional(),
  notes: z.string().optional().nullable(),
});

/**
 * GET /api/pricing/train-fares
 * List all train fares with optional filters
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    // Filters
    const trainTypeId = searchParams.get('trainTypeId');
    const classNumber = searchParams.get('classNumber');
    const isActive = searchParams.get('isActive');

    logger.info('Fetching train fares', 'Train Fares API', {
      page,
      limit,
      trainTypeId,
      classNumber,
      isActive,
    });

    // Build where clause
    const where: any = {};

    if (trainTypeId) {
      where.trainTypeId = parseInt(trainTypeId);
    }
    if (classNumber) {
      where.classNumber = parseInt(classNumber);
    }
    if (isActive !== null) {
      where.isActive = isActive === 'true';
    }

    // Get total count
    const total = await prisma.trainFare.count({ where });

    // Get train fares
    const trainFares = await prisma.trainFare.findMany({
      where,
      skip,
      take: limit,
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
      orderBy: [
        { trainTypeId: 'asc' },
        { classNumber: 'asc' },
      ],
    });

    logger.info(`Retrieved ${trainFares.length} train fares`, 'Train Fares API', { total });

    return successResponse(
      trainFares,
      'Train fares retrieved successfully',
      {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      }
    );
  } catch (error) {
    logger.error('Failed to fetch train fares', error as Error, 'Train Fares API');
    return handleError(error, 'Train Fares API');
  }
}

/**
 * POST /api/pricing/train-fares
 * Create new train fare
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createTrainFareSchema.parse(body);

    logger.info('Creating new train fare', 'Train Fares API', { data: validatedData });

    // Check if train type exists
    const trainType = await prisma.trainType.findUnique({
      where: { id: validatedData.trainTypeId },
    });

    if (!trainType) {
      return errorResponse(ErrorCodes.TRAIN_TYPE_NOT_FOUND, 'Train type not found', 404);
    }

    // Check if fare already exists for this trainType + classNumber combination
    const existingFare = await prisma.trainFare.findUnique({
      where: {
        trainTypeId_classNumber: {
          trainTypeId: validatedData.trainTypeId,
          classNumber: validatedData.classNumber,
        },
      },
    });

    if (existingFare) {
      return errorResponse(
        ErrorCodes.DUPLICATE_ENTRY,
        'Train fare for this train type and class already exists',
        409
      );
    }

    // Create train fare
    const newTrainFare = await prisma.trainFare.create({
      data: {
        ...validatedData,
        isActive: validatedData.isActive ?? true,
      },
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

    logger.info('Train fare created successfully', 'Train Fares API', { id: newTrainFare.id });

    return successResponse(newTrainFare, 'Train fare created successfully', null, 201);
  } catch (error) {
    logger.error('Failed to create train fare', error as Error, 'Train Fares API');
    return handleError(error, 'Train Fares API');
  }
}
