/**
 * Trains API Endpoint
 * GET /api/trains - List all trains
 * POST /api/trains - Create new train
 */

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, ErrorCodes } from '@/lib/api-response';
import { handleError } from '@/lib/error-handler';
import { logger } from '@/lib/logger';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

// Validation schema for creating train
const createTrainSchema = z.object({
  trainNumber: z.string().max(20),
  trainNameTh: z.string().max(255).optional(),
  trainNameEn: z.string().max(255).optional(),
  trainNameCn: z.string().max(255).optional(),
  trainTypeId: z.number().int().positive().optional(),
  originStationId: z.number().int().positive().optional(),
  destinationStationId: z.number().int().positive().optional(),
  departureTime: z.string(), // HH:mm format
  arrivalTime: z.string(), // HH:mm format
  durationMinutes: z.number().int().positive().optional(),
  operatingDays: z.string().default('daily'),
  runningOrder: z.number().int().optional(),
  serviceZone: z.string().max(100).optional(),
  totalDistanceKm: z.number().optional(),
  isActive: z.boolean().default(true),
  notes: z.string().optional(),
});

/**
 * GET /api/trains
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    // Filters
    const isActive = searchParams.get('active') === 'true' ? true : undefined;
    const trainTypeId = searchParams.get('trainTypeId');
    const search = searchParams.get('search');

    logger.info('Fetching trains', 'Trains API', { page, limit, search });

    // Build where clause
    const where: any = {
      ...(isActive !== undefined && { isActive }),
      ...(trainTypeId && { trainTypeId: parseInt(trainTypeId) }),
      ...(search && {
        OR: [
          { trainNumber: { contains: search } },
          { trainNameTh: { contains: search } },
          { trainNameEn: { contains: search } },
        ],
      }),
    };

    // Get trains with relations
    const [trains, total] = await Promise.all([
      prisma.train.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { trainNumber: 'asc' },
        ],
        include: {
          trainType: {
            select: {
              id: true,
              code: true,
              nameTh: true,
              nameEn: true,
              color: true,
            },
          },
          originStation: {
            select: {
              id: true,
              stationCode: true,
              codeTh: true,
              codeEn: true,
              nameTh: true,
              nameEn: true,
            },
          },
          destinationStation: {
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
      }),
      prisma.train.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    logger.info('Trains fetched successfully', 'Trains API', {
      count: trains.length,
      total,
    });

    return successResponse(
      trains,
      'Trains retrieved successfully',
      {
        total,
        page,
        limit,
        totalPages,
      }
    );
  } catch (error) {
    logger.error('Failed to fetch trains', error as Error, 'Trains API');
    return handleError(error, 'Trains API');
  }
}

/**
 * POST /api/trains
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createTrainSchema.parse(body);

    logger.info('Creating new train', 'Trains API', { data: validatedData });

    // Parse time strings to Date objects
    const departureTime = new Date(`2024-01-01T${validatedData.departureTime}:00`);
    const arrivalTime = new Date(`2024-01-01T${validatedData.arrivalTime}:00`);

    // Create train
    const train = await prisma.train.create({
      data: {
        ...validatedData,
        departureTime,
        arrivalTime,
      },
      include: {
        trainType: true,
        originStation: true,
        destinationStation: true,
      },
    });

    logger.info('Train created successfully', 'Trains API', { id: train.id });

    return successResponse(train, 'Train created successfully');
  } catch (error) {
    logger.error('Failed to create train', error as Error, 'Trains API');
    return handleError(error, 'Trains API');
  }
}
