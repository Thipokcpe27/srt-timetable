/**
 * Individual Announcement Management API
 * GET /api/announcements/:id - Get announcement by ID
 * PUT /api/announcements/:id - Update announcement
 * DELETE /api/announcements/:id - Delete announcement
 */

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, ErrorCodes } from '@/lib/api-response';
import { handleError } from '@/lib/error-handler';
import { logger } from '@/lib/logger';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const updateAnnouncementSchema = z.object({
  titleTh: z.string().min(1).max(255).optional(),
  titleEn: z.string().max(255).optional().nullable(),
  titleCn: z.string().max(255).optional().nullable(),
  contentTh: z.string().min(1).optional(),
  contentEn: z.string().optional().nullable(),
  contentCn: z.string().optional().nullable(),
  announcementType: z
    .enum([
      'general',
      'maintenance',
      'delay',
      'cancellation',
      'route_change',
      'promotion',
      'emergency',
    ])
    .optional(),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).optional(),
  startDate: z.string().datetime().optional().nullable(),
  endDate: z.string().datetime().optional().nullable(),
  trainId: z.number().int().positive().optional().nullable(),
  affectedRoutes: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
});

/**
 * GET /api/announcements/:id
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return errorResponse(ErrorCodes.INVALID_INPUT, 'Invalid announcement ID', 400);
    }

    logger.info(`Fetching announcement ${id}`, 'Announcements API');

    const announcement = await prisma.announcement.findUnique({
      where: { id },
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

    if (!announcement) {
      return errorResponse(
        ErrorCodes.RESOURCE_NOT_FOUND,
        'Announcement not found',
        404
      );
    }

    logger.info(`Announcement ${id} retrieved`, 'Announcements API');

    return successResponse(announcement, 'Announcement retrieved successfully');
  } catch (error) {
    logger.error(
      `Failed to fetch announcement ${params.id}`,
      error as Error,
      'Announcements API'
    );
    return handleError(error, 'Announcements API');
  }
}

/**
 * PUT /api/announcements/:id
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return errorResponse(ErrorCodes.INVALID_INPUT, 'Invalid announcement ID', 400);
    }

    const body = await request.json();
    const validatedData = updateAnnouncementSchema.parse(body);

    logger.info(`Updating announcement ${id}`, 'Announcements API', {
      data: validatedData,
    });

    // Check if announcement exists
    const existingAnnouncement = await prisma.announcement.findUnique({
      where: { id },
    });

    if (!existingAnnouncement) {
      return errorResponse(
        ErrorCodes.RESOURCE_NOT_FOUND,
        'Announcement not found',
        404
      );
    }

    // If trainId is being updated, verify train exists
    if (validatedData.trainId !== undefined && validatedData.trainId !== null) {
      const train = await prisma.train.findUnique({
        where: { id: validatedData.trainId },
      });

      if (!train) {
        return errorResponse(ErrorCodes.TRAIN_NOT_FOUND, 'Train not found', 404);
      }
    }

    // Validate date range if both dates are provided
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

    // Prepare update data
    const updateData: any = { ...validatedData };

    if (validatedData.startDate !== undefined) {
      updateData.startDate = validatedData.startDate ? new Date(validatedData.startDate) : null;
    }
    if (validatedData.endDate !== undefined) {
      updateData.endDate = validatedData.endDate ? new Date(validatedData.endDate) : null;
    }

    // Update announcement
    const updatedAnnouncement = await prisma.announcement.update({
      where: { id },
      data: updateData,
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

    logger.info(`Announcement ${id} updated successfully`, 'Announcements API');

    return successResponse(updatedAnnouncement, 'Announcement updated successfully');
  } catch (error) {
    logger.error(
      `Failed to update announcement ${params.id}`,
      error as Error,
      'Announcements API'
    );
    return handleError(error, 'Announcements API');
  }
}

/**
 * DELETE /api/announcements/:id
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return errorResponse(ErrorCodes.INVALID_INPUT, 'Invalid announcement ID', 400);
    }

    logger.info(`Deleting announcement ${id}`, 'Announcements API');

    // Check if announcement exists
    const existingAnnouncement = await prisma.announcement.findUnique({
      where: { id },
    });

    if (!existingAnnouncement) {
      return errorResponse(
        ErrorCodes.RESOURCE_NOT_FOUND,
        'Announcement not found',
        404
      );
    }

    // Delete announcement
    await prisma.announcement.delete({
      where: { id },
    });

    logger.info(`Announcement ${id} deleted successfully`, 'Announcements API');

    return successResponse({ id }, 'Announcement deleted successfully');
  } catch (error) {
    logger.error(
      `Failed to delete announcement ${params.id}`,
      error as Error,
      'Announcements API'
    );
    return handleError(error, 'Announcements API');
  }
}
