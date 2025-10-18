/**
 * Distance Fare Ranges Management API
 * GET /api/pricing/distance-fares/:id/ranges - List all ranges for a distance fare
 * POST /api/pricing/distance-fares/:id/ranges - Create new range for a distance fare
 */

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, ErrorCodes } from '@/lib/api-response';
import { handleError } from '@/lib/error-handler';
import { logger } from '@/lib/logger';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const createRangeSchema = z
  .object({
    minKm: z.number().min(0),
    maxKm: z.number().positive().optional().nullable(),
    farePerKm: z.number().positive().optional().nullable(),
    flatRate: z.number().min(0).optional().nullable(),
  })
  .refine((data) => data.farePerKm !== null || data.flatRate !== null, {
    message: 'Either farePerKm or flatRate must be provided',
  });

/**
 * GET /api/pricing/distance-fares/:id/ranges
 * Get all ranges for a distance fare
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const distanceFareId = parseInt(params.id);

    if (isNaN(distanceFareId)) {
      return errorResponse(ErrorCodes.INVALID_INPUT, 'Invalid distance fare ID', 400);
    }

    logger.info(
      `Fetching ranges for distance fare ${distanceFareId}`,
      'Distance Fare Ranges API'
    );

    // Check if distance fare exists
    const distanceFare = await prisma.distanceFare.findUnique({
      where: { id: distanceFareId },
    });

    if (!distanceFare) {
      return errorResponse(
        ErrorCodes.DISTANCE_FARE_NOT_FOUND,
        'Distance fare not found',
        404
      );
    }

    // Get all ranges for this distance fare
    const ranges = await prisma.distanceFareRange.findMany({
      where: { distanceFareId },
      orderBy: {
        minKm: 'asc',
      },
    });

    logger.info(
      `Retrieved ${ranges.length} ranges for distance fare ${distanceFareId}`,
      'Distance Fare Ranges API'
    );

    return successResponse(
      ranges,
      `Retrieved ${ranges.length} ranges successfully`
    );
  } catch (error) {
    logger.error(
      `Failed to fetch ranges for distance fare ${params.id}`,
      error as Error,
      'Distance Fare Ranges API'
    );
    return handleError(error, 'Distance Fare Ranges API');
  }
}

/**
 * POST /api/pricing/distance-fares/:id/ranges
 * Add range to a distance fare
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const distanceFareId = parseInt(params.id);

    if (isNaN(distanceFareId)) {
      return errorResponse(ErrorCodes.INVALID_INPUT, 'Invalid distance fare ID', 400);
    }

    const body = await request.json();
    const validatedData = createRangeSchema.parse(body);

    logger.info(`Adding range to distance fare ${distanceFareId}`, 'Distance Fare Ranges API', {
      data: validatedData,
    });

    // Check if distance fare exists
    const distanceFare = await prisma.distanceFare.findUnique({
      where: { id: distanceFareId },
    });

    if (!distanceFare) {
      return errorResponse(
        ErrorCodes.DISTANCE_FARE_NOT_FOUND,
        'Distance fare not found',
        404
      );
    }

    // Validate distance range
    if (validatedData.maxKm !== null && validatedData.maxKm !== undefined) {
      if (validatedData.maxKm <= validatedData.minKm) {
        return errorResponse(
          ErrorCodes.INVALID_INPUT,
          'maxKm must be greater than minKm',
          400
        );
      }
    }

    // Check for overlapping ranges
    const overlapping = await prisma.distanceFareRange.findFirst({
      where: {
        distanceFareId,
        OR: [
          {
            // New range starts within existing range
            AND: [
              { minKm: { lte: validatedData.minKm } },
              {
                OR: [
                  { maxKm: { gte: validatedData.minKm } },
                  { maxKm: null }, // null means infinity
                ],
              },
            ],
          },
          {
            // New range ends within existing range (if maxKm is provided)
            ...(validatedData.maxKm && {
              AND: [
                { minKm: { lte: validatedData.maxKm } },
                {
                  OR: [
                    { maxKm: { gte: validatedData.maxKm } },
                    { maxKm: null },
                  ],
                },
              ],
            }),
          },
          {
            // New range completely encompasses existing range
            ...(validatedData.maxKm && {
              AND: [
                { minKm: { gte: validatedData.minKm } },
                { minKm: { lte: validatedData.maxKm } },
              ],
            }),
          },
        ],
      },
    });

    if (overlapping) {
      return errorResponse(
        ErrorCodes.RESOURCE_CONFLICT,
        'Range overlaps with existing range for this distance fare',
        409
      );
    }

    // Create range
    const newRange = await prisma.distanceFareRange.create({
      data: {
        distanceFareId,
        ...validatedData,
      },
    });

    logger.info(`Range added to distance fare ${distanceFareId}`, 'Distance Fare Ranges API', {
      id: newRange.id,
    });

    return successResponse(newRange, 'Range added to distance fare successfully', null, 201);
  } catch (error) {
    logger.error(
      `Failed to add range to distance fare ${params.id}`,
      error as Error,
      'Distance Fare Ranges API'
    );
    return handleError(error, 'Distance Fare Ranges API');
  }
}
