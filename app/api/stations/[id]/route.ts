/**
 * Station Detail API
 * GET /api/stations/:id - Get station by ID
 * PUT /api/stations/:id - Update station
 * DELETE /api/stations/:id - Delete station
 */

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, ErrorCodes } from '@/lib/api-response';
import { handleError } from '@/lib/error-handler';
import { logger } from '@/lib/logger';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

// Validation schema for station update
const updateStationSchema = z.object({
  stationCode: z.number().optional(),
  codeTh: z.string().max(10).optional(),
  codeEn: z.string().max(10).optional(),
  codeCn: z.string().max(10).optional(),
  nameTh: z.string().max(255).optional(),
  nameEn: z.string().max(255).optional(),
  nameCn: z.string().max(255).optional(),
  displayNameTh: z.string().max(255).optional(),
  displayNameEn: z.string().max(255).optional(),
  displayNameCn: z.string().max(255).optional(),
  distanceForPricing: z.number().optional(),
  distanceActual: z.number().optional(),
  stationClass: z.string().max(20).optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  address: z.string().optional(),
  phone: z.string().max(20).optional(),
  facilities: z.array(z.string()).optional(),
  imageUrl: z.string().max(500).optional(),
  images: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
  notes: z.string().optional(),
});

/**
 * GET /api/stations/:id
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return errorResponse(ErrorCodes.INVALID_INPUT, 'Invalid station ID', 400);
    }

    logger.info(`Fetching station ${id}`, 'Station API');

    const station = await prisma.station.findUnique({
      where: { id },
    });

    if (!station) {
      return errorResponse(ErrorCodes.STATION_NOT_FOUND, 'Station not found', 404);
    }

    // Parse JSON fields
    const stationData = {
      ...station,
      facilities: station.facilities ? JSON.parse(station.facilities) : [],
      images: station.images ? JSON.parse(station.images) : [],
    };

    logger.info(`Station ${id} retrieved`, 'Station API');

    return successResponse(stationData, 'Station retrieved successfully');
  } catch (error) {
    logger.error(`Failed to fetch station ${params.id}`, error as Error, 'Station API');
    return handleError(error, 'Station API');
  }
}

/**
 * PUT /api/stations/:id
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return errorResponse(ErrorCodes.INVALID_INPUT, 'Invalid station ID', 400);
    }

    const body = await request.json();
    const validatedData = updateStationSchema.parse(body);

    logger.info(`Updating station ${id}`, 'Station API', { data: validatedData });

    // Check if station exists
    const existingStation = await prisma.station.findUnique({
      where: { id },
    });

    if (!existingStation) {
      return errorResponse(ErrorCodes.STATION_NOT_FOUND, 'Station not found', 404);
    }

    // Prepare update data
    const updateData: any = { ...validatedData };

    // Convert arrays to JSON strings
    if (validatedData.facilities) {
      updateData.facilities = JSON.stringify(validatedData.facilities);
    }
    if (validatedData.images) {
      updateData.images = JSON.stringify(validatedData.images);
    }

    // Update station
    const updatedStation = await prisma.station.update({
      where: { id },
      data: updateData,
    });

    // Parse JSON fields for response
    const stationData = {
      ...updatedStation,
      facilities: updatedStation.facilities ? JSON.parse(updatedStation.facilities) : [],
      images: updatedStation.images ? JSON.parse(updatedStation.images) : [],
    };

    logger.info(`Station ${id} updated successfully`, 'Station API');

    return successResponse(stationData, 'Station updated successfully');
  } catch (error) {
    logger.error(`Failed to update station ${params.id}`, error as Error, 'Station API');
    return handleError(error, 'Station API');
  }
}

/**
 * DELETE /api/stations/:id
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return errorResponse(ErrorCodes.INVALID_INPUT, 'Invalid station ID', 400);
    }

    logger.info(`Deleting station ${id}`, 'Station API');

    // Check if station exists
    const existingStation = await prisma.station.findUnique({
      where: { id },
    });

    if (!existingStation) {
      return errorResponse(ErrorCodes.STATION_NOT_FOUND, 'Station not found', 404);
    }

    // Delete station (soft delete would be better in production)
    await prisma.station.delete({
      where: { id },
    });

    logger.info(`Station ${id} deleted successfully`, 'Station API');

    return successResponse({ id }, 'Station deleted successfully');
  } catch (error) {
    logger.error(`Failed to delete station ${params.id}`, error as Error, 'Station API');
    return handleError(error, 'Station API');
  }
}
