/**
 * Health Check API Endpoint
 * Tests database connection and system status
 */

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, ErrorCodes } from '@/lib/api-response';
import { handleError } from '@/lib/error-handler';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    logger.info('Health check requested', 'Health API');

    // Test database connection
    const startTime = Date.now();
    await prisma.$queryRaw`SELECT 1 AS health_check`;
    const dbResponseTime = Date.now() - startTime;

    // Get database stats
    const stationCount = await prisma.station.count();
    const trainCount = await prisma.train.count();
    const trainTypeCount = await prisma.trainType.count();

    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        responseTime: `${dbResponseTime}ms`,
        stats: {
          stations: stationCount,
          trains: trainCount,
          trainTypes: trainTypeCount,
        },
      },
      environment: process.env.NODE_ENV,
      version: '1.0.0',
    };

    logger.info('Health check successful', 'Health API', {
      dbResponseTime,
      stationCount,
      trainCount,
    });

    return successResponse(healthData, 'System is healthy');
  } catch (error) {
    logger.error('Health check failed', error as Error, 'Health API');
    
    return handleError(error, 'Health API');
  }
}
