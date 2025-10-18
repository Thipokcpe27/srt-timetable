/**
 * Bogie AC Fares Management API
 * GET /api/bogies/:id/ac-fares - List all AC fares for a bogie
 * POST /api/bogies/:id/ac-fares - Create new AC fare for a bogie
 */

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, ErrorCodes } from '@/lib/api-response';
import { handleError } from '@/lib/error-handler';
import { logger } from '@/lib/logger';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const createBogieACFareSchema = z.object({
  minKm: z.number().min(0),
  maxKm: z.number().positive().optional().nullable(),
  acFare: z.number().min(0),
  notes: z.string().optional().nullable(),
});

/**
 * GET /api/bogies/:id/ac-fares
 * Get all AC fares for a bogie
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const bogieId = parseInt(params.id);

    if (isNaN(bogieId)) {
      return errorResponse(ErrorCodes.INVALID_INPUT, 'Invalid bogie ID', 400);
    }

    logger.info(`Fetching AC fares for bogie ${bogieId}`, 'Bogie AC Fares API');

    // Check if bogie exists
    const bogie = await prisma.bogie.findUnique({
      where: { id: bogieId },
    });

    if (!bogie) {
      return errorResponse(ErrorCodes.BOGIE_NOT_FOUND, 'Bogie not found', 404);
    }

    // Get all AC fares for this bogie
    const acFares = await prisma.bogieACFare.findMany({
      where: { bogieId },
      orderBy: {
        minKm: 'asc',
      },
    });

    logger.info(
      `Retrieved ${acFares.length} AC fares for bogie ${bogieId}`,
      'Bogie AC Fares API'
    );

    return successResponse(
      acFares,
      `Retrieved ${acFares.length} AC fares successfully`
    );
  } catch (error) {
    logger.error(
      `Failed to fetch AC fares for bogie ${params.id}`,
      error as Error,
      'Bogie AC Fares API'
    );
    return handleError(error, 'Bogie AC Fares API');
  }
}

/**
 * POST /api/bogies/:id/ac-fares
 * Add AC fare to a bogie
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const bogieId = parseInt(params.id);

    if (isNaN(bogieId)) {
      return errorResponse(ErrorCodes.INVALID_INPUT, 'Invalid bogie ID', 400);
    }

    const body = await request.json();
    const validatedData = createBogieACFareSchema.parse(body);

    logger.info(`Adding AC fare to bogie ${bogieId}`, 'Bogie AC Fares API', {
      data: validatedData,
    });

    // Check if bogie exists
    const bogie = await prisma.bogie.findUnique({
      where: { id: bogieId },
    });

    if (!bogie) {
      return errorResponse(ErrorCodes.BOGIE_NOT_FOUND, 'Bogie not found', 404);
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

    // Check for overlapping ranges for this bogie
    const overlapping = await prisma.bogieACFare.findFirst({
      where: {
        bogieId,
        OR: [
          {
            AND: [
              { minKm: { lte: validatedData.minKm } },
              {
                OR: [
                  { maxKm: { gte: validatedData.minKm } },
                  { maxKm: null },
                ],
              },
            ],
          },
          {
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
        'AC fare range overlaps with existing range for this bogie',
        409
      );
    }

    // Create bogie AC fare
    const newACFare = await prisma.bogieACFare.create({
      data: {
        bogieId,
        ...validatedData,
      },
    });

    logger.info(`AC fare added to bogie ${bogieId}`, 'Bogie AC Fares API', {
      id: newACFare.id,
    });

    return successResponse(newACFare, 'AC fare added to bogie successfully', null, 201);
  } catch (error) {
    logger.error(
      `Failed to add AC fare to bogie ${params.id}`,
      error as Error,
      'Bogie AC Fares API'
    );
    return handleError(error, 'Bogie AC Fares API');
  }
}
