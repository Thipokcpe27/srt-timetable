import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, ErrorCodes } from '@/lib/api-response';
import { logger } from '@/lib/logger';

/**
 * GET /api/amenities/[id]
 * Fetch a single amenity by ID
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const amenityId = parseInt(id);
    logger.info('[Amenities API] Fetching amenity', undefined, { id: amenityId });

    const amenity = await prisma.amenity.findUnique({
      where: { id: parseInt(id) },
    });

    if (!amenity) {
      return errorResponse(ErrorCodes.RESOURCE_NOT_FOUND, 'Amenity not found', 404);
    }

    return successResponse(amenity);
  } catch (error) {
    logger.error('[Amenities API] Error fetching amenity', error as Error);
    return errorResponse(ErrorCodes.INTERNAL_SERVER_ERROR, 'Failed to fetch amenity', 500);
  }
}

/**
 * PUT /api/amenities/[id]
 * Update an amenity
 */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const amenityId = parseInt(id);
    logger.info('[Amenities API] Updating amenity', undefined, { id: amenityId });

    const amenity = await prisma.amenity.update({
      where: { id: parseInt(id) },
      data: {
        code: body.code,
        nameTh: body.nameTh,
        nameEn: body.nameEn,
        nameCn: body.nameCn || null,
        icon: body.icon,
        isActive: body.isActive,
      },
    });

    logger.info('[Amenities API] Amenity updated successfully', undefined, { id: amenityId });

    return successResponse(amenity, 'Amenity updated successfully');
  } catch (error) {
    logger.error('[Amenities API] Error updating amenity', error as Error);
    return errorResponse(ErrorCodes.INTERNAL_SERVER_ERROR, 'Failed to update amenity', 500);
  }
}

/**
 * DELETE /api/amenities/[id]
 * Delete an amenity
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const amenityId = parseInt(id);
    logger.info('[Amenities API] Deleting amenity', undefined, { id: amenityId });

    await prisma.amenity.delete({
      where: { id: parseInt(id) },
    });

    logger.info('[Amenities API] Amenity deleted successfully', undefined, { id: amenityId });

    return successResponse(null, 'Amenity deleted successfully');
  } catch (error) {
    logger.error('[Amenities API] Error deleting amenity', error as Error);
    return errorResponse(ErrorCodes.INTERNAL_SERVER_ERROR, 'Failed to delete amenity', 500);
  }
}
