/**
 * Distance Fares Management API
 * GET /api/pricing/distance-fares - List all distance fares
 * POST /api/pricing/distance-fares - Create new distance fare
 */

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, ErrorCodes } from '@/lib/api-response';
import { handleError } from '@/lib/error-handler';
import { logger } from '@/lib/logger';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const createDistanceFareSchema = z.object({
  code: z.string().max(50),
  nameTh: z.string().max(100),
  nameEn: z.string().max(100).optional().nullable(),
  classNumber: z.number().int().min(1).max(3),
  sortOrder: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

/**
 * GET /api/pricing/distance-fares
 * List all distance fares with optional filters
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    // Filters
    const classNumber = searchParams.get('classNumber');
    const isActive = searchParams.get('isActive');
    const includeRanges = searchParams.get('includeRanges') === 'true';

    logger.info('Fetching distance fares', 'Distance Fares API', {
      page,
      limit,
      classNumber,
      isActive,
      includeRanges,
    });

    // Build where clause
    const where: any = {};

    if (classNumber) {
      where.classNumber = parseInt(classNumber);
    }
    if (isActive !== null) {
      where.isActive = isActive === 'true';
    }

    // Get total count
    const total = await prisma.distanceFare.count({ where });

    // Get distance fares
    const distanceFares = await prisma.distanceFare.findMany({
      where,
      skip,
      take: limit,
      include: includeRanges
        ? {
            distanceFareRanges: {
              orderBy: {
                minKm: 'asc',
              },
            },
          }
        : undefined,
      orderBy: [
        { classNumber: 'asc' },
        { sortOrder: 'asc' },
        { code: 'asc' },
      ],
    });

    logger.info(`Retrieved ${distanceFares.length} distance fares`, 'Distance Fares API', {
      total,
    });

    return successResponse(
      distanceFares,
      'Distance fares retrieved successfully',
      {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      }
    );
  } catch (error) {
    logger.error('Failed to fetch distance fares', error as Error, 'Distance Fares API');
    return handleError(error, 'Distance Fares API');
  }
}

/**
 * POST /api/pricing/distance-fares
 * Create new distance fare
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createDistanceFareSchema.parse(body);

    logger.info('Creating new distance fare', 'Distance Fares API', { data: validatedData });

    // Check if code already exists
    const existingFare = await prisma.distanceFare.findUnique({
      where: { code: validatedData.code },
    });

    if (existingFare) {
      return errorResponse(
        ErrorCodes.DUPLICATE_ENTRY,
        'Distance fare with this code already exists',
        409
      );
    }

    // Create distance fare
    const newDistanceFare = await prisma.distanceFare.create({
      data: {
        ...validatedData,
        sortOrder: validatedData.sortOrder ?? 0,
        isActive: validatedData.isActive ?? true,
      },
    });

    logger.info('Distance fare created successfully', 'Distance Fares API', {
      id: newDistanceFare.id,
    });

    return successResponse(newDistanceFare, 'Distance fare created successfully', null, 201);
  } catch (error) {
    logger.error('Failed to create distance fare', error as Error, 'Distance Fares API');
    return handleError(error, 'Distance Fares API');
  }
}
