/**
 * Pricing Calculation API
 * POST /api/pricing/calculate - Calculate train fare
 */

import { NextRequest } from 'next/server';
import { successResponse, errorResponse, ErrorCodes } from '@/lib/api-response';
import { handleError } from '@/lib/error-handler';
import { logger } from '@/lib/logger';
import { calculatePrice, PriceCalculationRequest } from '@/lib/pricing-engine';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const calculatePriceSchema = z.object({
  trainId: z.number().int().positive(),
  fromStationId: z.number().int().positive(),
  toStationId: z.number().int().positive(),
  bogieId: z.number().int().positive(),
  berthType: z.enum(['upper', 'lower', 'single']).optional(),
});

/**
 * POST /api/pricing/calculate
 * Calculate train fare with detailed breakdown
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = calculatePriceSchema.parse(body);

    // Validate that from and to stations are different
    if (validatedData.fromStationId === validatedData.toStationId) {
      return errorResponse(
        ErrorCodes.INVALID_INPUT,
        'From and to stations must be different',
        400
      );
    }

    logger.info(
      `Price calculation request: train ${validatedData.trainId}, ${validatedData.fromStationId} → ${validatedData.toStationId}, bogie ${validatedData.bogieId}`,
      'Pricing API'
    );

    const calculationRequest: PriceCalculationRequest = {
      trainId: validatedData.trainId,
      fromStationId: validatedData.fromStationId,
      toStationId: validatedData.toStationId,
      bogieId: validatedData.bogieId,
      berthType: validatedData.berthType,
    };

    const result = await calculatePrice(calculationRequest);

    logger.info(
      `Price calculated successfully: ${result.totalFare} ฿`,
      'Pricing API'
    );

    return successResponse(
      result,
      'Price calculated successfully'
    );
  } catch (error) {
    const err = error as Error;

    // Handle specific errors
    if (err.message.includes('not found')) {
      return errorResponse(
        ErrorCodes.RESOURCE_NOT_FOUND,
        err.message,
        404
      );
    }

    if (err.message.includes('not configured')) {
      return errorResponse(
        ErrorCodes.PRICING_CALCULATION_ERROR,
        err.message,
        400
      );
    }

    logger.error('Failed to calculate price', err, 'Pricing API');
    return handleError(error, 'Pricing API');
  }
}
