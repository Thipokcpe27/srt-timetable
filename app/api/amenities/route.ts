import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, ErrorCodes } from '@/lib/api-response';
import { logger } from '@/lib/logger';

/**
 * GET /api/amenities
 * Fetch all amenities
 */
export async function GET(request: NextRequest) {
  try {
    logger.info('[Amenities API] Fetching amenities');

    const amenities = await prisma.amenity.findMany({
      orderBy: { nameTh: 'asc' },
    });

    logger.info('[Amenities API] Amenities fetched successfully', undefined, {
      count: amenities.length,
    });

    return successResponse(amenities);
  } catch (error) {
    logger.error('[Amenities API] Error fetching amenities', error as Error);
    return errorResponse(ErrorCodes.INTERNAL_SERVER_ERROR, 'Failed to fetch amenities', 500);
  }
}

/**
 * POST /api/amenities
 * Create a new amenity
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    logger.info('[Amenities API] Creating amenity');

    const amenity = await prisma.amenity.create({
      data: {
        code: body.code,
        nameTh: body.nameTh,
        nameEn: body.nameEn,
        nameCn: body.nameCn || null,
        icon: body.icon,
        isActive: body.isActive !== undefined ? body.isActive : true,
      },
    });

    logger.info('[Amenities API] Amenity created successfully', undefined, { id: amenity.id });

    return successResponse(amenity, 'Amenity created successfully', null, 201);
  } catch (error) {
    logger.error('[Amenities API] Error creating amenity', error as Error);
    return errorResponse(ErrorCodes.INTERNAL_SERVER_ERROR, 'Failed to create amenity', 500);
  }
}
