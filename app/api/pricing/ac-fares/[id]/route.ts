/**
 * Individual AC Fare Management API
 * GET /api/pricing/ac-fares/:id - Get AC fare by ID
 * PUT /api/pricing/ac-fares/:id - Update AC fare
 * DELETE /api/pricing/ac-fares/:id - Delete AC fare
 */

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, ErrorCodes } from '@/lib/api-response';
import { handleError } from '@/lib/error-handler';
import { logger } from '@/lib/logger';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const updateACFareSchema = z.object({
  acFareCategoryId: z.number().int().positive().optional(),
  minKm: z.number().min(0).optional(),
  maxKm: z.number().positive().optional().nullable(),
  fareAmount: z.number().min(0).optional(),
});

/**
 * GET /api/pricing/ac-fares/:id
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return errorResponse(ErrorCodes.INVALID_INPUT, 'Invalid AC fare ID', 400);
    }

    logger.info(`Fetching AC fare ${id}`, 'AC Fares API');

    const acFare = await prisma.aCFare.findUnique({
      where: { id },
      include: {
        acFareCategory: true,
      },
    });

    if (!acFare) {
      return errorResponse(ErrorCodes.AC_FARE_NOT_FOUND, 'AC fare not found', 404);
    }

    logger.info(`AC fare ${id} retrieved`, 'AC Fares API');

    return successResponse(acFare, 'AC fare retrieved successfully');
  } catch (error) {
    logger.error(`Failed to fetch AC fare ${params.id}`, error as Error, 'AC Fares API');
    return handleError(error, 'AC Fares API');
  }
}

/**
 * PUT /api/pricing/ac-fares/:id
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return errorResponse(ErrorCodes.INVALID_INPUT, 'Invalid AC fare ID', 400);
    }

    const body = await request.json();
    const validatedData = updateACFareSchema.parse(body);

    logger.info(`Updating AC fare ${id}`, 'AC Fares API', { data: validatedData });

    // Check if AC fare exists
    const existingFare = await prisma.aCFare.findUnique({
      where: { id },
    });

    if (!existingFare) {
      return errorResponse(ErrorCodes.AC_FARE_NOT_FOUND, 'AC fare not found', 404);
    }

    // If updating category, check if it exists
    if (validatedData.acFareCategoryId) {
      const category = await prisma.aCFareCategory.findUnique({
        where: { id: validatedData.acFareCategoryId },
      });

      if (!category) {
        return errorResponse(
          ErrorCodes.RESOURCE_NOT_FOUND,
          'AC fare category not found',
          404
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
    const categoryId = validatedData.acFareCategoryId ?? existingFare.acFareCategoryId;

    const overlapping = await prisma.aCFare.findFirst({
      where: {
        id: { not: id },
        acFareCategoryId: categoryId,
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
        'AC fare range overlaps with existing range in this category',
        409
      );
    }

    // Update AC fare
    const updatedFare = await prisma.aCFare.update({
      where: { id },
      data: validatedData,
      include: {
        acFareCategory: true,
      },
    });

    logger.info(`AC fare ${id} updated successfully`, 'AC Fares API');

    return successResponse(updatedFare, 'AC fare updated successfully');
  } catch (error) {
    logger.error(`Failed to update AC fare ${params.id}`, error as Error, 'AC Fares API');
    return handleError(error, 'AC Fares API');
  }
}

/**
 * DELETE /api/pricing/ac-fares/:id
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return errorResponse(ErrorCodes.INVALID_INPUT, 'Invalid AC fare ID', 400);
    }

    logger.info(`Deleting AC fare ${id}`, 'AC Fares API');

    // Check if AC fare exists
    const existingFare = await prisma.aCFare.findUnique({
      where: { id },
    });

    if (!existingFare) {
      return errorResponse(ErrorCodes.AC_FARE_NOT_FOUND, 'AC fare not found', 404);
    }

    // Delete AC fare
    await prisma.aCFare.delete({
      where: { id },
    });

    logger.info(`AC fare ${id} deleted successfully`, 'AC Fares API');

    return successResponse({ id }, 'AC fare deleted successfully');
  } catch (error) {
    logger.error(`Failed to delete AC fare ${params.id}`, error as Error, 'AC Fares API');
    return handleError(error, 'AC Fares API');
  }
}
