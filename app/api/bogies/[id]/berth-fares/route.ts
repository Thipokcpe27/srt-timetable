/**
 * Bogie Berth Fares Management API
 * GET /api/bogies/:id/berth-fares - List all berth fares for a bogie
 * POST /api/bogies/:id/berth-fares - Create new berth fare for a bogie
 */

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, ErrorCodes } from '@/lib/api-response';
import { handleError } from '@/lib/error-handler';
import { logger } from '@/lib/logger';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const createBerthFareSchema = z.object({
  berthType: z.enum(['upper', 'lower', 'single']),
  minKm: z.number().min(0),
  maxKm: z.number().positive().optional().nullable(),
  fareAmount: z.number().min(0),
  notes: z.string().optional().nullable(),
});

/**
 * GET /api/bogies/:id/berth-fares
 * Get all berth fares for a bogie
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

    const searchParams = request.nextUrl.searchParams;
    const berthType = searchParams.get('berthType');

    logger.info(`Fetching berth fares for bogie ${bogieId}`, 'Berth Fares API', {
      berthType,
    });

    // Check if bogie exists
    const bogie = await prisma.bogie.findUnique({
      where: { id: bogieId },
    });

    if (!bogie) {
      return errorResponse(ErrorCodes.BOGIE_NOT_FOUND, 'Bogie not found', 404);
    }

    // Build where clause
    const where: any = { bogieId };

    if (berthType) {
      where.berthType = berthType;
    }

    // Get all berth fares for this bogie
    const berthFares = await prisma.berthFare.findMany({
      where,
      orderBy: [
        { berthType: 'asc' },
        { minKm: 'asc' },
      ],
    });

    logger.info(
      `Retrieved ${berthFares.length} berth fares for bogie ${bogieId}`,
      'Berth Fares API'
    );

    return successResponse(
      berthFares,
      `Retrieved ${berthFares.length} berth fares successfully`
    );
  } catch (error) {
    logger.error(
      `Failed to fetch berth fares for bogie ${params.id}`,
      error as Error,
      'Berth Fares API'
    );
    return handleError(error, 'Berth Fares API');
  }
}

/**
 * POST /api/bogies/:id/berth-fares
 * Add berth fare to a bogie
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
    const validatedData = createBerthFareSchema.parse(body);

    logger.info(`Adding berth fare to bogie ${bogieId}`, 'Berth Fares API', {
      data: validatedData,
    });

    // Check if bogie exists
    const bogie = await prisma.bogie.findUnique({
      where: { id: bogieId },
    });

    if (!bogie) {
      return errorResponse(ErrorCodes.BOGIE_NOT_FOUND, 'Bogie not found', 404);
    }

    // Validate that this is a sleeper bogie
    if (!bogie.isSleeper) {
      return errorResponse(
        ErrorCodes.INVALID_INPUT,
        'Cannot add berth fares to non-sleeper bogie',
        400
      );
    }

    // Validate berth type matches bogie configuration
    if (validatedData.berthType === 'upper' && !bogie.upperBerths) {
      return errorResponse(
        ErrorCodes.INVALID_INPUT,
        'This bogie does not have upper berths',
        400
      );
    }
    if (validatedData.berthType === 'lower' && !bogie.lowerBerths) {
      return errorResponse(
        ErrorCodes.INVALID_INPUT,
        'This bogie does not have lower berths',
        400
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

    // Check for overlapping ranges for this bogie and berth type
    const overlapping = await prisma.berthFare.findFirst({
      where: {
        bogieId,
        berthType: validatedData.berthType,
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
        'Berth fare range overlaps with existing range for this bogie and berth type',
        409
      );
    }

    // Create berth fare
    const newBerthFare = await prisma.berthFare.create({
      data: {
        bogieId,
        ...validatedData,
      },
    });

    logger.info(`Berth fare added to bogie ${bogieId}`, 'Berth Fares API', {
      id: newBerthFare.id,
    });

    return successResponse(newBerthFare, 'Berth fare added to bogie successfully', null, 201);
  } catch (error) {
    logger.error(
      `Failed to add berth fare to bogie ${params.id}`,
      error as Error,
      'Berth Fares API'
    );
    return handleError(error, 'Berth Fares API');
  }
}
