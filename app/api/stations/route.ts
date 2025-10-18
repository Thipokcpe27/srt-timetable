/**
 * Stations API Endpoint
 * GET /api/stations - List all stations
 * POST /api/stations - Create new station
 */

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, ErrorCodes } from '@/lib/api-response';
import { handleError } from '@/lib/error-handler';
import { logger } from '@/lib/logger';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

// Validation schema for creating station
const createStationSchema = z.object({
  stationCode: z.number().int().positive(),
  codeTh: z.string().max(10),
  codeEn: z.string().max(10),
  codeCn: z.string().max(10).optional(),
  nameTh: z.string().max(255),
  nameEn: z.string().max(255),
  nameCn: z.string().max(255).optional(),
  displayNameTh: z.string().max(255).optional(),
  displayNameEn: z.string().max(255).optional(),
  displayNameCn: z.string().max(255).optional(),
  distanceForPricing: z.number().default(0),
  distanceActual: z.number().default(0),
  stationClass: z.string().max(20).optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  address: z.string().optional(),
  phone: z.string().max(20).optional(),
  facilities: z.array(z.string()).optional(),
  imageUrl: z.string().max(500).optional(),
  images: z.array(z.string()).optional(),
  isActive: z.boolean().default(true),
  notes: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    // Filters
    const isActive = searchParams.get('active') === 'true' ? true : undefined;
    const search = searchParams.get('search');

    logger.info('Fetching stations', 'Stations API', { page, limit, search });

    // Build where clause
    const where = {
      ...(isActive !== undefined && { isActive }),
      ...(search && {
        OR: [
          { nameTh: { contains: search } },
          { nameEn: { contains: search } },
          { codeTh: { contains: search } },
          { codeEn: { contains: search } },
        ],
      }),
    };

    // Get stations
    const [stations, total] = await Promise.all([
      prisma.station.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { stationCode: 'asc' },
        ],
        select: {
          id: true,
          stationCode: true,
          codeTh: true,
          codeEn: true,
          nameTh: true,
          nameEn: true,
          nameCn: true,
          stationClass: true,
          latitude: true,
          longitude: true,
          isActive: true,
        },
      }),
      prisma.station.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    logger.info('Stations fetched successfully', 'Stations API', {
      count: stations.length,
      total,
    });

    return successResponse(
      stations,
      'Stations retrieved successfully',
      {
        total,
        page,
        limit,
        totalPages,
      }
    );
  } catch (error) {
    logger.error('Failed to fetch stations', error as Error, 'Stations API');
    return handleError(error, 'Stations API');
  }
}

/**
 * POST /api/stations
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createStationSchema.parse(body);

    logger.info('Creating new station', 'Stations API', { data: validatedData });

    // Prepare data for database
    const createData: any = { ...validatedData };

    // Convert arrays to JSON strings
    if (validatedData.facilities) {
      createData.facilities = JSON.stringify(validatedData.facilities);
    }
    if (validatedData.images) {
      createData.images = JSON.stringify(validatedData.images);
    }

    // Create station
    const station = await prisma.station.create({
      data: createData,
    });

    // Parse JSON fields for response
    const stationData = {
      ...station,
      facilities: station.facilities ? JSON.parse(station.facilities) : [],
      images: station.images ? JSON.parse(station.images) : [],
    };

    logger.info('Station created successfully', 'Stations API', { id: station.id });

    return successResponse(stationData, 'Station created successfully');
  } catch (error) {
    logger.error('Failed to create station', error as Error, 'Stations API');
    return handleError(error, 'Stations API');
  }
}
