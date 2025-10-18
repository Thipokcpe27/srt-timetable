/**
 * AC Fares Management API
 * GET /api/pricing/ac-fares - List all AC fares
 * POST /api/pricing/ac-fares - Create new AC fare
 */

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, ErrorCodes } from '@/lib/api-response';
import { handleError } from '@/lib/error-handler';
import { logger } from '@/lib/logger';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const createACFareSchema = z.object({
  acFareCategoryId: z.number().int().positive(),
  minKm: z.number().min(0),
  maxKm: z.number().positive().optional().nullable(),
  fareAmount: z.number().min(0),
});

/**
 * GET /api/pricing/ac-fares
 * List all AC fares with optional filters
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '100');
    const skip = (page - 1) * limit;

    // Filters
    const acFareCategoryId = searchParams.get('categoryId');
    const minKm = searchParams.get('minKm');

    logger.info('Fetching AC fares', 'AC Fares API', {
      page,
      limit,
      acFareCategoryId,
      minKm,
    });

    // Build where clause
    const where: any = {};

    if (acFareCategoryId) {
      where.acFareCategoryId = parseInt(acFareCategoryId);
    }
    if (minKm) {
      where.minKm = {
        gte: parseFloat(minKm),
      };
    }

    // Get total count
    const total = await prisma.aCFare.count({ where });

    // Get AC fares
    const acFares = await prisma.aCFare.findMany({
      where,
      skip,
      take: limit,
      include: {
        acFareCategory: {
          select: {
            id: true,
            code: true,
            nameTh: true,
            nameEn: true,
          },
        },
      },
      orderBy: [
        { acFareCategoryId: 'asc' },
        { minKm: 'asc' },
      ],
    });

    logger.info(`Retrieved ${acFares.length} AC fares`, 'AC Fares API', { total });

    return successResponse(
      acFares,
      'AC fares retrieved successfully',
      {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      }
    );
  } catch (error) {
    logger.error('Failed to fetch AC fares', error as Error, 'AC Fares API');
    return handleError(error, 'AC Fares API');
  }
}

/**
 * POST /api/pricing/ac-fares
 * Create new AC fare
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createACFareSchema.parse(body);

    logger.info('Creating new AC fare', 'AC Fares API', { data: validatedData });

    // Check if AC fare category exists
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

    // Check for overlapping ranges in the same category
    const overlapping = await prisma.aCFare.findFirst({
      where: {
        acFareCategoryId: validatedData.acFareCategoryId,
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
        'AC fare range overlaps with existing range in this category',
        409
      );
    }

    // Create AC fare
    const newACFare = await prisma.aCFare.create({
      data: validatedData,
      include: {
        acFareCategory: {
          select: {
            id: true,
            code: true,
            nameTh: true,
            nameEn: true,
          },
        },
      },
    });

    logger.info('AC fare created successfully', 'AC Fares API', { id: newACFare.id });

    return successResponse(newACFare, 'AC fare created successfully', null, 201);
  } catch (error) {
    logger.error('Failed to create AC fare', error as Error, 'AC Fares API');
    return handleError(error, 'AC Fares API');
  }
}
