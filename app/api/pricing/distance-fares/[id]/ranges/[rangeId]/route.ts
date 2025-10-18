/**
 * Individual Distance Fare Range Management API
 * GET /api/pricing/distance-fares/:id/ranges/:rangeId - Get specific range
 * PUT /api/pricing/distance-fares/:id/ranges/:rangeId - Update range
 * DELETE /api/pricing/distance-fares/:id/ranges/:rangeId - Delete range
 */

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, ErrorCodes } from '@/lib/api-response';
import { handleError } from '@/lib/error-handler';
import { logger } from '@/lib/logger';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const updateRangeSchema = z
  .object({
    minKm: z.number().min(0).optional(),
    maxKm: z.number().positive().optional().nullable(),
    farePerKm: z.number().positive().optional().nullable(),
    flatRate: z.number().min(0).optional().nullable(),
  })
  .refine(
    (data) => {
      // If updating fare values, at least one must be non-null
      const hasFareUpdate = data.farePerKm !== undefined || data.flatRate !== undefined;
      if (!hasFareUpdate) return true; // Not updating fares, so no validation needed

      // If updating, ensure at least one is provided and not null
      return data.farePerKm !== null || data.flatRate !== null;
    },
    {
      message: 'Either farePerKm or flatRate must be provided',
    }
  );

/**
 * GET /api/pricing/distance-fares/:id/ranges/:rangeId
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; rangeId: string } }
) {
  try {
    const distanceFareId = parseInt(params.id);
    const rangeId = parseInt(params.rangeId);

    if (isNaN(distanceFareId) || isNaN(rangeId)) {
      return errorResponse(
        ErrorCodes.INVALID_INPUT,
        'Invalid distance fare ID or range ID',
        400
      );
    }

    logger.info(
      `Fetching range ${rangeId} for distance fare ${distanceFareId}`,
      'Distance Fare Ranges API'
    );

    const range = await prisma.distanceFareRange.findFirst({
      where: {
        id: rangeId,
        distanceFareId,
      },
      include: {
        distanceFare: {
          select: {
            id: true,
            code: true,
            nameTh: true,
            nameEn: true,
            classNumber: true,
          },
        },
      },
    });

    if (!range) {
      return errorResponse(ErrorCodes.RESOURCE_NOT_FOUND, 'Range not found', 404);
    }

    return successResponse(range, 'Range retrieved successfully');
  } catch (error) {
    logger.error(
      `Failed to fetch range ${params.rangeId} for distance fare ${params.id}`,
      error as Error,
      'Distance Fare Ranges API'
    );
    return handleError(error, 'Distance Fare Ranges API');
  }
}

/**
 * PUT /api/pricing/distance-fares/:id/ranges/:rangeId
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; rangeId: string } }
) {
  try {
    const distanceFareId = parseInt(params.id);
    const rangeId = parseInt(params.rangeId);

    if (isNaN(distanceFareId) || isNaN(rangeId)) {
      return errorResponse(
        ErrorCodes.INVALID_INPUT,
        'Invalid distance fare ID or range ID',
        400
      );
    }

    const body = await request.json();
    const validatedData = updateRangeSchema.parse(body);

    logger.info(
      `Updating range ${rangeId} for distance fare ${distanceFareId}`,
      'Distance Fare Ranges API',
      { data: validatedData }
    );

    // Check if range exists
    const existingRange = await prisma.distanceFareRange.findFirst({
      where: {
        id: rangeId,
        distanceFareId,
      },
    });

    if (!existingRange) {
      return errorResponse(ErrorCodes.RESOURCE_NOT_FOUND, 'Range not found', 404);
    }

    // Validate distance range
    const newMinKm = validatedData.minKm ?? existingRange.minKm;
    const newMaxKm =
      validatedData.maxKm !== undefined ? validatedData.maxKm : existingRange.maxKm;

    if (newMaxKm !== null && newMaxKm <= newMinKm) {
      return errorResponse(ErrorCodes.INVALID_INPUT, 'maxKm must be greater than minKm', 400);
    }

    // Check for overlapping ranges (exclude current range)
    const overlapping = await prisma.distanceFareRange.findFirst({
      where: {
        id: { not: rangeId },
        distanceFareId,
        OR: [
          {
            AND: [
              { minKm: { lte: newMinKm } },
              {
                OR: [{ maxKm: { gte: newMinKm } }, { maxKm: null }],
              },
            ],
          },
          {
            ...(newMaxKm && {
              AND: [
                { minKm: { lte: newMaxKm } },
                {
                  OR: [{ maxKm: { gte: newMaxKm } }, { maxKm: null }],
                },
              ],
            }),
          },
          {
            ...(newMaxKm && {
              AND: [{ minKm: { gte: newMinKm } }, { minKm: { lte: newMaxKm } }],
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

    // Update range
    const updatedRange = await prisma.distanceFareRange.update({
      where: { id: rangeId },
      data: validatedData,
    });

    logger.info(`Range ${rangeId} updated successfully`, 'Distance Fare Ranges API');

    return successResponse(updatedRange, 'Range updated successfully');
  } catch (error) {
    logger.error(
      `Failed to update range ${params.rangeId} for distance fare ${params.id}`,
      error as Error,
      'Distance Fare Ranges API'
    );
    return handleError(error, 'Distance Fare Ranges API');
  }
}

/**
 * DELETE /api/pricing/distance-fares/:id/ranges/:rangeId
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; rangeId: string } }
) {
  try {
    const distanceFareId = parseInt(params.id);
    const rangeId = parseInt(params.rangeId);

    if (isNaN(distanceFareId) || isNaN(rangeId)) {
      return errorResponse(
        ErrorCodes.INVALID_INPUT,
        'Invalid distance fare ID or range ID',
        400
      );
    }

    logger.info(
      `Deleting range ${rangeId} for distance fare ${distanceFareId}`,
      'Distance Fare Ranges API'
    );

    // Check if range exists
    const existingRange = await prisma.distanceFareRange.findFirst({
      where: {
        id: rangeId,
        distanceFareId,
      },
    });

    if (!existingRange) {
      return errorResponse(ErrorCodes.RESOURCE_NOT_FOUND, 'Range not found', 404);
    }

    await prisma.distanceFareRange.delete({
      where: { id: rangeId },
    });

    logger.info(`Range ${rangeId} deleted successfully`, 'Distance Fare Ranges API');

    return successResponse({ id: rangeId }, 'Range deleted successfully');
  } catch (error) {
    logger.error(
      `Failed to delete range ${params.rangeId} for distance fare ${params.id}`,
      error as Error,
      'Distance Fare Ranges API'
    );
    return handleError(error, 'Distance Fare Ranges API');
  }
}
