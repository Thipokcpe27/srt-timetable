/**
 * Bogies Management API
 * GET /api/bogies - List all bogies
 * POST /api/bogies - Create new bogie
 */

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, ErrorCodes } from '@/lib/api-response';
import { handleError } from '@/lib/error-handler';
import { logger } from '@/lib/logger';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const createBogieSchema = z.object({
  code: z.string().max(50),
  nameTh: z.string().max(100),
  nameEn: z.string().max(100).optional().nullable(),
  nameCn: z.string().max(100).optional().nullable(),
  shortNameTh: z.string().max(50).optional().nullable(),
  shortNameEn: z.string().max(50).optional().nullable(),
  classNumber: z.number().int().min(1).max(3),
  bogieClass: z.string().max(50),
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
 * GET /api/bogies
 * List all bogies with optional filters
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    // Filters
    const classNumber = searchParams.get('class');
    const hasAC = searchParams.get('hasAC');
    const isSleeper = searchParams.get('isSleeper');
    const isActive = searchParams.get('isActive');
    const search = searchParams.get('search');

    logger.info('Fetching bogies', 'Bogies API', {
      page,
      limit,
      classNumber,
      hasAC,
      isSleeper,
      isActive,
      search,
    });

    // Build where clause
    const where: any = {};

    if (classNumber) {
      where.classNumber = parseInt(classNumber);
    }
    if (hasAC !== null) {
      where.hasAC = hasAC === 'true';
    }
    if (isSleeper !== null) {
      where.isSleeper = isSleeper === 'true';
    }
    if (isActive !== null) {
      where.isActive = isActive === 'true';
    }
    if (search) {
      where.OR = [
        { code: { contains: search, mode: 'insensitive' } },
        { nameTh: { contains: search, mode: 'insensitive' } },
        { nameEn: { contains: search, mode: 'insensitive' } },
        { shortNameTh: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get total count
    const total = await prisma.bogie.count({ where });

    // Get bogies
    const bogies = await prisma.bogie.findMany({
      where,
      skip,
      take: limit,
      orderBy: [
        { sortOrder: 'asc' },
        { classNumber: 'asc' },
        { code: 'asc' },
      ],
    });

    logger.info(`Retrieved ${bogies.length} bogies`, 'Bogies API', { total });

    return successResponse(
      bogies,
      'Bogies retrieved successfully',
      {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      }
    );
  } catch (error) {
    logger.error('Failed to fetch bogies', error as Error, 'Bogies API');
    return handleError(error, 'Bogies API');
  }
}

/**
 * POST /api/bogies
 * Create new bogie
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createBogieSchema.parse(body);

    logger.info('Creating new bogie', 'Bogies API', { data: validatedData });

    // Check if code already exists
    const existingBogie = await prisma.bogie.findUnique({
      where: { code: validatedData.code },
    });

    if (existingBogie) {
      return errorResponse(
        ErrorCodes.DUPLICATE_ENTRY,
        'Bogie with this code already exists',
        409
      );
    }

    // Create bogie
    const newBogie = await prisma.bogie.create({
      data: {
        ...validatedData,
        hasAC: validatedData.hasAC ?? false,
        isSleeper: validatedData.isSleeper ?? false,
        sortOrder: validatedData.sortOrder ?? 0,
        isActive: validatedData.isActive ?? true,
      },
    });

    logger.info('Bogie created successfully', 'Bogies API', { id: newBogie.id });

    return successResponse(newBogie, 'Bogie created successfully', null, 201);
  } catch (error) {
    logger.error('Failed to create bogie', error as Error, 'Bogies API');
    return handleError(error, 'Bogies API');
  }
}
