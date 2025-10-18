/**
 * Individual Bogie AC Fare Management API
 * GET /api/bogies/:id/ac-fares/:fareId - Get specific AC fare
 * PUT /api/bogies/:id/ac-fares/:fareId - Update AC fare
 * DELETE /api/bogies/:id/ac-fares/:fareId - Delete AC fare
 */

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, ErrorCodes } from '@/lib/api-response';
import { handleError } from '@/lib/error-handler';
import { logger } from '@/lib/logger';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const updateBogieACFareSchema = z.object({
  minKm: z.number().min(0).optional(),
  maxKm: z.number().positive().optional().nullable(),
  acFare: z.number().min(0).optional(),
  notes: z.string().optional().nullable(),
});

/**
 * GET /api/bogies/:id/ac-fares/:fareId
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; fareId: string } }
) {
  try {
    const bogieId = parseInt(params.id);
    const fareId = parseInt(params.fareId);

    if (isNaN(bogieId) || isNaN(fareId)) {
      return errorResponse(ErrorCodes.INVALID_INPUT, 'Invalid bogie ID or fare ID', 400);
    }

    logger.info(
      `Fetching AC fare ${fareId} for bogie ${bogieId}`,
      'Bogie AC Fares API'
    );

    const acFare = await prisma.bogieACFare.findFirst({
      where: {
        id: fareId,
        bogieId,
      },
      include: {
        bogie: {
          select: {
            id: true,
            code: true,
            nameTh: true,
            nameEn: true,
          },
        },
      },
    });

    if (!acFare) {
      return errorResponse(ErrorCodes.AC_FARE_NOT_FOUND, 'AC fare not found', 404);
    }

    return successResponse(acFare, 'AC fare retrieved successfully');
  } catch (error) {
    logger.error(
      `Failed to fetch AC fare ${params.fareId} for bogie ${params.id}`,
      error as Error,
      'Bogie AC Fares API'
    );
    return handleError(error, 'Bogie AC Fares API');
  }
}

/**
 * PUT /api/bogies/:id/ac-fares/:fareId
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; fareId: string } }
) {
  try {
    const bogieId = parseInt(params.id);
    const fareId = parseInt(params.fareId);

    if (isNaN(bogieId) || isNaN(fareId)) {
      return errorResponse(ErrorCodes.INVALID_INPUT, 'Invalid bogie ID or fare ID', 400);
    }

    const body = await request.json();
    const validatedData = updateBogieACFareSchema.parse(body);

    logger.info(
      `Updating AC fare ${fareId} for bogie ${bogieId}`,
      'Bogie AC Fares API',
      { data: validatedData }
    );

    // Check if AC fare exists
    const existingFare = await prisma.bogieACFare.findFirst({
      where: {
        id: fareId,
        bogieId,
      },
    });

    if (!existingFare) {
      return errorResponse(ErrorCodes.AC_FARE_NOT_FOUND, 'AC fare not found', 404);
    }

    // Validate distance range
    const newMinKm = validatedData.minKm ?? existingFare.minKm;
    const newMaxKm =
      validatedData.maxKm !== undefined ? validatedData.maxKm : existingFare.maxKm;

    if (newMaxKm !== null && newMaxKm <= newMinKm) {
      return errorResponse(ErrorCodes.INVALID_INPUT, 'maxKm must be greater than minKm', 400);
    }

    // Check for overlapping ranges (exclude current fare)
    const overlapping = await prisma.bogieACFare.findFirst({
      where: {
        id: { not: fareId },
        bogieId,
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
        'AC fare range overlaps with existing range for this bogie',
        409
      );
    }

    // Update AC fare
    const updatedFare = await prisma.bogieACFare.update({
      where: { id: fareId },
      data: validatedData,
    });

    logger.info(`AC fare ${fareId} updated successfully`, 'Bogie AC Fares API');

    return successResponse(updatedFare, 'AC fare updated successfully');
  } catch (error) {
    logger.error(
      `Failed to update AC fare ${params.fareId} for bogie ${params.id}`,
      error as Error,
      'Bogie AC Fares API'
    );
    return handleError(error, 'Bogie AC Fares API');
  }
}

/**
 * DELETE /api/bogies/:id/ac-fares/:fareId
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; fareId: string } }
) {
  try {
    const bogieId = parseInt(params.id);
    const fareId = parseInt(params.fareId);

    if (isNaN(bogieId) || isNaN(fareId)) {
      return errorResponse(ErrorCodes.INVALID_INPUT, 'Invalid bogie ID or fare ID', 400);
    }

    logger.info(
      `Deleting AC fare ${fareId} for bogie ${bogieId}`,
      'Bogie AC Fares API'
    );

    // Check if AC fare exists
    const existingFare = await prisma.bogieACFare.findFirst({
      where: {
        id: fareId,
        bogieId,
      },
    });

    if (!existingFare) {
      return errorResponse(ErrorCodes.AC_FARE_NOT_FOUND, 'AC fare not found', 404);
    }

    await prisma.bogieACFare.delete({
      where: { id: fareId },
    });

    logger.info(`AC fare ${fareId} deleted successfully`, 'Bogie AC Fares API');

    return successResponse({ id: fareId }, 'AC fare deleted successfully');
  } catch (error) {
    logger.error(
      `Failed to delete AC fare ${params.fareId} for bogie ${params.id}`,
      error as Error,
      'Bogie AC Fares API'
    );
    return handleError(error, 'Bogie AC Fares API');
  }
}
