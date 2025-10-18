/**
 * Announcements Management API
 * GET /api/announcements - List all announcements
 * POST /api/announcements - Create new announcement
 */

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, ErrorCodes } from '@/lib/api-response';
import { handleError } from '@/lib/error-handler';
import { logger } from '@/lib/logger';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const createAnnouncementSchema = z.object({
  titleTh: z.string().min(1).max(255),
  titleEn: z.string().max(255).optional().nullable(),
  titleCn: z.string().max(255).optional().nullable(),
  contentTh: z.string().min(1),
  contentEn: z.string().optional().nullable(),
  contentCn: z.string().optional().nullable(),
  announcementType: z.enum([
    'general',
    'maintenance',
    'delay',
    'cancellation',
    'route_change',
    'promotion',
    'emergency',
  ]),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).optional(),
  startDate: z.string().datetime().optional().nullable(),
  endDate: z.string().datetime().optional().nullable(),
  trainId: z.number().int().positive().optional().nullable(),
  affectedRoutes: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
});

/**
 * GET /api/announcements
 * List all announcements with filters
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // Filters
    const announcementType = searchParams.get('type');
    const priority = searchParams.get('priority');
    const trainId = searchParams.get('trainId');
    const isActive = searchParams.get('isActive');
    const currentOnly = searchParams.get('currentOnly') === 'true';

    logger.info('Fetching announcements', 'Announcements API', {
      page,
      limit,
      announcementType,
      priority,
      trainId,
      isActive,
      currentOnly,
    });

    // Build where clause
    const where: any = {};

    if (announcementType) {
      where.announcementType = announcementType;
    }
    if (priority) {
      where.priority = priority;
    }
    if (trainId) {
      where.trainId = parseInt(trainId);
    }
    if (isActive !== null) {
      where.isActive = isActive === 'true';
    }

    // Filter for current announcements (within date range)
    if (currentOnly) {
      const now = new Date();
      where.AND = [
        {
          OR: [{ startDate: null }, { startDate: { lte: now } }],
        },
        {
          OR: [{ endDate: null }, { endDate: { gte: now } }],
        },
      ];
    }

    // Get total count
    const total = await prisma.announcement.count({ where });

    // Get announcements
    const announcements = await prisma.announcement.findMany({
      where,
      skip,
      take: limit,
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
      orderBy: [
        { priority: 'desc' },
        { startDate: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    logger.info(`Retrieved ${announcements.length} announcements`, 'Announcements API', {
      total,
    });

    return successResponse(
      announcements,
      'Announcements retrieved successfully',
      {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      }
    );
  } catch (error) {
    logger.error('Failed to fetch announcements', error as Error, 'Announcements API');
    return handleError(error, 'Announcements API');
  }
}

/**
 * POST /api/announcements
 * Create new announcement
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createAnnouncementSchema.parse(body);

    logger.info('Creating new announcement', 'Announcements API', {
      type: validatedData.announcementType,
      priority: validatedData.priority,
    });

    // If trainId is provided, verify train exists
    if (validatedData.trainId) {
      const train = await prisma.train.findUnique({
        where: { id: validatedData.trainId },
      });

      if (!train) {
        return errorResponse(ErrorCodes.TRAIN_NOT_FOUND, 'Train not found', 404);
      }
    }

    // Validate date range
    if (validatedData.startDate && validatedData.endDate) {
      const start = new Date(validatedData.startDate);
      const end = new Date(validatedData.endDate);

      if (end <= start) {
        return errorResponse(
          ErrorCodes.INVALID_INPUT,
          'End date must be after start date',
          400
        );
      }
    }

    // Create announcement
    const newAnnouncement = await prisma.announcement.create({
      data: {
        ...validatedData,
        priority: validatedData.priority || 'normal',
        isActive: validatedData.isActive ?? true,
        startDate: validatedData.startDate ? new Date(validatedData.startDate) : null,
        endDate: validatedData.endDate ? new Date(validatedData.endDate) : null,
      },
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
    });

    logger.info('Announcement created successfully', 'Announcements API', {
      id: newAnnouncement.id,
    });

    return successResponse(
      newAnnouncement,
      'Announcement created successfully',
      null,
      201
    );
  } catch (error) {
    logger.error('Failed to create announcement', error as Error, 'Announcements API');
    return handleError(error, 'Announcements API');
  }
}
