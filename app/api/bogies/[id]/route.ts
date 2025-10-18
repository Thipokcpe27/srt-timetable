/**
 * Individual Bogie Management API
 * GET /api/bogies/:id - Get bogie by ID
 * PUT /api/bogies/:id - Update bogie
 * DELETE /api/bogies/:id - Delete bogie
 */

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, ErrorCodes } from '@/lib/api-response';
import { handleError } from '@/lib/error-handler';
import { logger } from '@/lib/logger';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const updateBogieSchema = z.object({
  code: z.string().max(50).optional(),
  nameTh: z.string().max(100).optional(),
  nameEn: z.string().max(100).optional().nullable(),
  nameCn: z.string().max(100).optional().nullable(),
  shortNameTh: z.string().max(50).optional().nullable(),
  shortNameEn: z.string().max(50).optional().nullable(),
  classNumber: z.number().int().min(1).max(3).optional(),
  bogieClass: z.string().max(50).optional(),
  hasAC: z.boolean().optional(),
  isSleeper: z.boolean().optional(),
  totalSeats: z.number().int().positive().optional().nullable(),
  upperBerths: z.number().int().min(0).optional().nullable(),
  lowerBerths: z.number().int().min(0).optional().nullable(),
  sortOrder: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
  notes: z.string().optional().nullable(),
});

/**
 * GET /api/bogies/:id
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return errorResponse(ErrorCodes.INVALID_INPUT, 'Invalid bogie ID', 400);
    }

    logger.info(`Fetching bogie ${id}`, 'Bogies API');

    const bogie = await prisma.bogie.findUnique({
      where: { id },
      include: {
        trainCompositions: {
          include: {
            train: {
              select: {
                id: true,
                trainNumber: true,
                trainNameTh: true,
                trainNameEn: true,
              },
            },
          },
        },
        bogieACFares: true,
        berthFares: true,
        bogieAmenities: {
          include: {
            amenity: true,
          },
        },
      },
    });

    if (!bogie) {
      return errorResponse(ErrorCodes.BOGIE_NOT_FOUND, 'Bogie not found', 404);
    }

    logger.info(`Bogie ${id} retrieved`, 'Bogies API');

    return successResponse(bogie, 'Bogie retrieved successfully');
  } catch (error) {
    logger.error(`Failed to fetch bogie ${params.id}`, error as Error, 'Bogies API');
    return handleError(error, 'Bogies API');
  }
}

/**
 * PUT /api/bogies/:id
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return errorResponse(ErrorCodes.INVALID_INPUT, 'Invalid bogie ID', 400);
    }

    const body = await request.json();
    const validatedData = updateBogieSchema.parse(body);

    logger.info(`Updating bogie ${id}`, 'Bogies API', { data: validatedData });

    // Check if bogie exists
    const existingBogie = await prisma.bogie.findUnique({
      where: { id },
    });

    if (!existingBogie) {
      return errorResponse(ErrorCodes.BOGIE_NOT_FOUND, 'Bogie not found', 404);
    }

    // If updating code, check for conflicts
    if (validatedData.code && validatedData.code !== existingBogie.code) {
      const codeConflict = await prisma.bogie.findUnique({
        where: { code: validatedData.code },
      });

      if (codeConflict) {
        return errorResponse(
          ErrorCodes.DUPLICATE_ENTRY,
          'Bogie with this code already exists',
          409
        );
      }
    }

    // Update bogie
    const updatedBogie = await prisma.bogie.update({
      where: { id },
      data: validatedData,
    });

    logger.info(`Bogie ${id} updated successfully`, 'Bogies API');

    return successResponse(updatedBogie, 'Bogie updated successfully');
  } catch (error) {
    logger.error(`Failed to update bogie ${params.id}`, error as Error, 'Bogies API');
    return handleError(error, 'Bogies API');
  }
}

/**
 * DELETE /api/bogies/:id
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return errorResponse(ErrorCodes.INVALID_INPUT, 'Invalid bogie ID', 400);
    }

    logger.info(`Deleting bogie ${id}`, 'Bogies API');

    // Check if bogie exists
    const existingBogie = await prisma.bogie.findUnique({
      where: { id },
    });

    if (!existingBogie) {
      return errorResponse(ErrorCodes.BOGIE_NOT_FOUND, 'Bogie not found', 404);
    }

    // Check if bogie is used in any train compositions
    const compositionCount = await prisma.trainComposition.count({
      where: { bogieId: id },
    });

    if (compositionCount > 0) {
      return errorResponse(
        ErrorCodes.CANNOT_DELETE,
        `Cannot delete bogie. It is used in ${compositionCount} train composition(s)`,
        409
      );
    }

    // Delete bogie
    await prisma.bogie.delete({
      where: { id },
    });

    logger.info(`Bogie ${id} deleted successfully`, 'Bogies API');

    return successResponse({ id }, 'Bogie deleted successfully');
  } catch (error) {
    logger.error(`Failed to delete bogie ${params.id}`, error as Error, 'Bogies API');
    return handleError(error, 'Bogies API');
  }
}
