/**
 * Individual Berth Fare Management API
 * GET /api/bogies/:id/berth-fares/:fareId - Get specific berth fare
 * PUT /api/bogies/:id/berth-fares/:fareId - Update berth fare
 * DELETE /api/bogies/:id/berth-fares/:fareId - Delete berth fare
 */

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, ErrorCodes } from '@/lib/api-response';
import { handleError } from '@/lib/error-handler';
import { logger } from '@/lib/logger';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const updateBerthFareSchema = z.object({
  berthType: z.enum(['upper', 'lower', 'single']).optional(),
  minKm: z.number().min(0).optional(),
  maxKm: z.number().positive().optional().nullable(),
  fareAmount: z.number().min(0).optional(),
  notes: z.string().optional().nullable(),
});

/**
 * GET /api/bogies/:id/berth-fares/:fareId
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
      `Fetching berth fare ${fareId} for bogie ${bogieId}`,
      'Berth Fares API'
    );

    const berthFare = await prisma.berthFare.findFirst({
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
            isSleeper: true,
            upperBerths: true,
            lowerBerths: true,
          },
        },
      },
    });

    if (!berthFare) {
      return errorResponse(ErrorCodes.BERTH_FARE_NOT_FOUND, 'Berth fare not found', 404);
    }

    return successResponse(berthFare, 'Berth fare retrieved successfully');
  } catch (error) {
    logger.error(
      `Failed to fetch berth fare ${params.fareId} for bogie ${params.id}`,
      error as Error,
      'Berth Fares API'
    );
    return handleError(error, 'Berth Fares API');
  }
}

/**
 * PUT /api/bogies/:id/berth-fares/:fareId
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
    const validatedData = updateBerthFareSchema.parse(body);

    logger.info(
      `Updating berth fare ${fareId} for bogie ${bogieId}`,
      'Berth Fares API',
      { data: validatedData }
    );

    // Check if berth fare exists
    const existingFare = await prisma.berthFare.findFirst({
      where: {
        id: fareId,
        bogieId,
      },
      include: {
        bogie: true,
      },
    });

    if (!existingFare) {
      return errorResponse(ErrorCodes.BERTH_FARE_NOT_FOUND, 'Berth fare not found', 404);
    }

    // Validate berth type if being changed
    if (validatedData.berthType && validatedData.berthType !== existingFare.berthType) {
      if (validatedData.berthType === 'upper' && !existingFare.bogie.upperBerths) {
        return errorResponse(
          ErrorCodes.INVALID_INPUT,
          'This bogie does not have upper berths',
          400
        );
      }
      if (validatedData.berthType === 'lower' && !existingFare.bogie.lowerBerths) {
        return errorResponse(
          ErrorCodes.INVALID_INPUT,
          'This bogie does not have lower berths',
          400
        );
      }
    }

    // Validate distance range
    const newMinKm = validatedData.minKm ?? existingFare.minKm;
    const newMaxKm =
      validatedData.maxKm !== undefined ? validatedData.maxKm : existingFare.maxKm;

    if (newMaxKm !== null && newMaxKm <= newMinKm) {
      return errorResponse(ErrorCodes.INVALID_INPUT, 'maxKm must be greater than minKm', 400);
    }

    // Check for overlapping ranges (exclude current fare)
    const newBerthType = validatedData.berthType ?? existingFare.berthType;

    const overlapping = await prisma.berthFare.findFirst({
      where: {
        id: { not: fareId },
        bogieId,
        berthType: newBerthType,
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
        'Berth fare range overlaps with existing range for this bogie and berth type',
        409
      );
    }

    // Update berth fare
    const updatedFare = await prisma.berthFare.update({
      where: { id: fareId },
      data: validatedData,
    });

    logger.info(`Berth fare ${fareId} updated successfully`, 'Berth Fares API');

    return successResponse(updatedFare, 'Berth fare updated successfully');
  } catch (error) {
    logger.error(
      `Failed to update berth fare ${params.fareId} for bogie ${params.id}`,
      error as Error,
      'Berth Fares API'
    );
    return handleError(error, 'Berth Fares API');
  }
}

/**
 * DELETE /api/bogies/:id/berth-fares/:fareId
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
      `Deleting berth fare ${fareId} for bogie ${bogieId}`,
      'Berth Fares API'
    );

    // Check if berth fare exists
    const existingFare = await prisma.berthFare.findFirst({
      where: {
        id: fareId,
        bogieId,
      },
    });

    if (!existingFare) {
      return errorResponse(ErrorCodes.BERTH_FARE_NOT_FOUND, 'Berth fare not found', 404);
    }

    await prisma.berthFare.delete({
      where: { id: fareId },
    });

    logger.info(`Berth fare ${fareId} deleted successfully`, 'Berth Fares API');

    return successResponse({ id: fareId }, 'Berth fare deleted successfully');
  } catch (error) {
    logger.error(
      `Failed to delete berth fare ${params.fareId} for bogie ${params.id}`,
      error as Error,
      'Berth Fares API'
    );
    return handleError(error, 'Berth Fares API');
  }
}
