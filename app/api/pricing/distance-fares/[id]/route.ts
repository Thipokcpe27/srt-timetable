/**
 * Individual Distance Fare Management API
 * GET /api/pricing/distance-fares/:id - Get distance fare by ID
 * PUT /api/pricing/distance-fares/:id - Update distance fare
 * DELETE /api/pricing/distance-fares/:id - Delete distance fare
 */

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, ErrorCodes } from '@/lib/api-response';
import { handleError } from '@/lib/error-handler';
import { logger } from '@/lib/logger';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const updateDistanceFareSchema = z.object({
  code: z.string().max(50).optional(),
  nameTh: z.string().max(100).optional(),
  nameEn: z.string().max(100).optional().nullable(),
  classNumber: z.number().int().min(1).max(3).optional(),
  sortOrder: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

/**
 * GET /api/pricing/distance-fares/:id
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return errorResponse(ErrorCodes.INVALID_INPUT, 'Invalid distance fare ID', 400);
    }

    logger.info(`Fetching distance fare ${id}`, 'Distance Fares API');

    const distanceFare = await prisma.distanceFare.findUnique({
      where: { id },
      include: {
        distanceFareRanges: {
          orderBy: {
            minKm: 'asc',
          },
        },
      },
    });

    if (!distanceFare) {
      return errorResponse(
        ErrorCodes.DISTANCE_FARE_NOT_FOUND,
        'Distance fare not found',
        404
      );
    }

    logger.info(`Distance fare ${id} retrieved`, 'Distance Fares API');

    return successResponse(distanceFare, 'Distance fare retrieved successfully');
  } catch (error) {
    logger.error(
      `Failed to fetch distance fare ${params.id}`,
      error as Error,
      'Distance Fares API'
    );
    return handleError(error, 'Distance Fares API');
  }
}

/**
 * PUT /api/pricing/distance-fares/:id
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return errorResponse(ErrorCodes.INVALID_INPUT, 'Invalid distance fare ID', 400);
    }

    const body = await request.json();
    const validatedData = updateDistanceFareSchema.parse(body);

    logger.info(`Updating distance fare ${id}`, 'Distance Fares API', { data: validatedData });

    // Check if distance fare exists
    const existingFare = await prisma.distanceFare.findUnique({
      where: { id },
    });

    if (!existingFare) {
      return errorResponse(
        ErrorCodes.DISTANCE_FARE_NOT_FOUND,
        'Distance fare not found',
        404
      );
    }

    // If updating code, check for conflicts
    if (validatedData.code && validatedData.code !== existingFare.code) {
      const codeConflict = await prisma.distanceFare.findUnique({
        where: { code: validatedData.code },
      });

      if (codeConflict) {
        return errorResponse(
          ErrorCodes.DUPLICATE_ENTRY,
          'Distance fare with this code already exists',
          409
        );
      }
    }

    // Update distance fare
    const updatedFare = await prisma.distanceFare.update({
      where: { id },
      data: validatedData,
      include: {
        distanceFareRanges: {
          orderBy: {
            minKm: 'asc',
          },
        },
      },
    });

    logger.info(`Distance fare ${id} updated successfully`, 'Distance Fares API');

    return successResponse(updatedFare, 'Distance fare updated successfully');
  } catch (error) {
    logger.error(
      `Failed to update distance fare ${params.id}`,
      error as Error,
      'Distance Fares API'
    );
    return handleError(error, 'Distance Fares API');
  }
}

/**
 * DELETE /api/pricing/distance-fares/:id
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return errorResponse(ErrorCodes.INVALID_INPUT, 'Invalid distance fare ID', 400);
    }

    logger.info(`Deleting distance fare ${id}`, 'Distance Fares API');

    // Check if distance fare exists
    const existingFare = await prisma.distanceFare.findUnique({
      where: { id },
      include: {
        distanceFareRanges: true,
      },
    });

    if (!existingFare) {
      return errorResponse(
        ErrorCodes.DISTANCE_FARE_NOT_FOUND,
        'Distance fare not found',
        404
      );
    }

    // Delete distance fare (cascade will delete ranges)
    await prisma.distanceFare.delete({
      where: { id },
    });

    logger.info(`Distance fare ${id} deleted successfully`, 'Distance Fares API');

    return successResponse({ id }, 'Distance fare deleted successfully');
  } catch (error) {
    logger.error(
      `Failed to delete distance fare ${params.id}`,
      error as Error,
      'Distance Fares API'
    );
    return handleError(error, 'Distance Fares API');
  }
}
