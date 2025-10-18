/**
 * Route Distance Calculator Service
 * Calculates distances between all station pairs on a train route
 * Populates the RouteDistance table for pricing calculations
 */

import { prisma } from './prisma';
import { logger } from './logger';
import { Decimal } from '@prisma/client/runtime/library';

export interface StationDistance {
  stationId: number;
  stationCode: string;
  stationName: string;
  distanceFromOrigin: number;
  stopOrder: number;
}

export interface RouteDistanceResult {
  fromStationId: number;
  toStationId: number;
  distanceKm: number;
  distanceForPricing: number;
}

/**
 * Calculate distances between all station pairs on a train route
 */
export async function calculateTrainRouteDistances(
  trainId: number
): Promise<RouteDistanceResult[]> {
  logger.info(`Calculating route distances for train ${trainId}`, 'Route Distance Calculator');

  // Get train with all stops ordered by stopOrder
  const train = await prisma.train.findUnique({
    where: { id: trainId },
    include: {
      trainStops: {
        where: { isActive: true },
        include: {
          station: {
            select: {
              id: true,
              stationCode: true,
              nameTh: true,
              distanceForPricing: true,
              distanceActual: true,
            },
          },
        },
        orderBy: { stopOrder: 'asc' },
      },
    },
  });

  if (!train) {
    throw new Error(`Train ${trainId} not found`);
  }

  if (train.trainStops.length < 2) {
    logger.warn(
      `Train ${trainId} has less than 2 stops, cannot calculate distances`,
      'Route Distance Calculator'
    );
    return [];
  }

  const stops = train.trainStops;
  const results: RouteDistanceResult[] = [];

  // Calculate distances between all station pairs
  for (let i = 0; i < stops.length; i++) {
    for (let j = i + 1; j < stops.length; j++) {
      const fromStop = stops[i];
      const toStop = stops[j];

      if (!fromStop || !toStop) continue;

      // Calculate distance based on distanceFromOrigin (if available)
      let distanceKm = 0;
      let distanceForPricing = 0;

      if (
        fromStop.distanceFromOrigin !== null &&
        toStop.distanceFromOrigin !== null
      ) {
        // Use the difference between distances from origin
        const fromDist = Number(fromStop.distanceFromOrigin);
        const toDist = Number(toStop.distanceFromOrigin);
        distanceKm = Math.abs(toDist - fromDist);
        distanceForPricing = distanceKm; // Can be adjusted with multiplier if needed
      } else {
        // Fallback: Use station's built-in distance data
        const fromStationDist = Number(fromStop.station.distanceActual || 0);
        const toStationDist = Number(toStop.station.distanceActual || 0);
        distanceKm = Math.abs(toStationDist - fromStationDist);

        // Use distanceForPricing from station if available
        const fromPricingDist = Number(fromStop.station.distanceForPricing || fromStationDist);
        const toPricingDist = Number(toStop.station.distanceForPricing || toStationDist);
        distanceForPricing = Math.abs(toPricingDist - fromPricingDist);
      }

      // Round to 2 decimal places
      distanceKm = Math.round(distanceKm * 100) / 100;
      distanceForPricing = Math.round(distanceForPricing * 100) / 100;

      results.push({
        fromStationId: fromStop.stationId,
        toStationId: toStop.stationId,
        distanceKm,
        distanceForPricing,
      });

      logger.debug(
        `Calculated distance from ${fromStop.station.nameTh} to ${toStop.station.nameTh}: ${distanceKm} km`,
        'Route Distance Calculator'
      );
    }
  }

  logger.info(
    `Calculated ${results.length} route distances for train ${trainId}`,
    'Route Distance Calculator'
  );

  return results;
}

/**
 * Save calculated distances to the database
 * Replaces existing distances for the train
 */
export async function saveRouteDistances(
  trainId: number,
  distances: RouteDistanceResult[]
): Promise<number> {
  logger.info(
    `Saving ${distances.length} route distances for train ${trainId}`,
    'Route Distance Calculator'
  );

  // Delete existing distances for this train
  await prisma.routeDistance.deleteMany({
    where: { trainId },
  });

  // Insert new distances in a transaction
  const created = await prisma.$transaction(
    distances.map((distance) =>
      prisma.routeDistance.create({
        data: {
          trainId,
          fromStationId: distance.fromStationId,
          toStationId: distance.toStationId,
          distanceKm: new Decimal(distance.distanceKm),
          distanceForPricing: new Decimal(distance.distanceForPricing),
        },
      })
    )
  );

  logger.info(
    `Saved ${created.length} route distances for train ${trainId}`,
    'Route Distance Calculator'
  );

  return created.length;
}

/**
 * Calculate and save distances for a train (all in one)
 */
export async function calculateAndSaveTrainDistances(
  trainId: number
): Promise<{ calculated: number; saved: number }> {
  const distances = await calculateTrainRouteDistances(trainId);
  const saved = await saveRouteDistances(trainId, distances);

  return {
    calculated: distances.length,
    saved,
  };
}

/**
 * Get distance between two stations on a specific train route
 */
export async function getRouteDistance(
  trainId: number,
  fromStationId: number,
  toStationId: number
): Promise<RouteDistanceResult | null> {
  // Try to find in database first
  const distance = await prisma.routeDistance.findFirst({
    where: {
      trainId,
      OR: [
        { fromStationId, toStationId },
        { fromStationId: toStationId, toStationId: fromStationId }, // Check reverse direction
      ],
    },
  });

  if (distance) {
    return {
      fromStationId: distance.fromStationId,
      toStationId: distance.toStationId,
      distanceKm: Number(distance.distanceKm),
      distanceForPricing: Number(distance.distanceForPricing),
    };
  }

  // If not found, calculate on-the-fly
  logger.warn(
    `Distance not found in database for train ${trainId}, calculating on-the-fly`,
    'Route Distance Calculator'
  );

  const allDistances = await calculateTrainRouteDistances(trainId);
  const found = allDistances.find(
    (d) =>
      (d.fromStationId === fromStationId && d.toStationId === toStationId) ||
      (d.fromStationId === toStationId && d.toStationId === fromStationId)
  );

  return found || null;
}

/**
 * Batch calculate distances for multiple trains
 */
export async function calculateAllTrainDistances(): Promise<{
  processed: number;
  totalDistances: number;
  errors: string[];
}> {
  logger.info('Starting batch calculation for all trains', 'Route Distance Calculator');

  const trains = await prisma.train.findMany({
    where: { isActive: true },
    select: { id: true, trainNumber: true },
  });

  let processed = 0;
  let totalDistances = 0;
  const errors: string[] = [];

  for (const train of trains) {
    try {
      const result = await calculateAndSaveTrainDistances(train.id);
      processed++;
      totalDistances += result.saved;
      logger.info(
        `Processed train ${train.trainNumber}: ${result.saved} distances`,
        'Route Distance Calculator'
      );
    } catch (error) {
      const errorMsg = `Failed to process train ${train.trainNumber}: ${(error as Error).message}`;
      errors.push(errorMsg);
      logger.error(errorMsg, error as Error, 'Route Distance Calculator');
    }
  }

  logger.info(
    `Batch calculation complete: ${processed}/${trains.length} trains, ${totalDistances} distances`,
    'Route Distance Calculator'
  );

  return { processed, totalDistances, errors };
}
