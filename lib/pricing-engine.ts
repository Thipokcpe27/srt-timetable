/**
 * Pricing Engine - Core Fare Calculation Logic
 * Calculates total train fare based on:
 * 1. Distance Fare (based on km and class)
 * 2. Train Fare (train type surcharge)
 * 3. AC Fare (air conditioning surcharge)
 * 4. Berth Fare (sleeping berth surcharge)
 */

import { prisma } from './prisma';
import { logger } from './logger';
import { getRouteDistance } from './route-distance-calculator';
import { Decimal } from '@prisma/client/runtime/library';

export interface PriceCalculationRequest {
  trainId: number;
  fromStationId: number;
  toStationId: number;
  bogieId: number;
  berthType?: 'upper' | 'lower' | 'single';
}

export interface PriceBreakdown {
  distanceFare: number;
  trainFare: number;
  acFare: number;
  berthFare: number;
  subtotal: number;
  adjustments: number;
  total: number;
}

export interface PriceCalculationResult {
  success: boolean;
  totalFare: number;
  breakdown: PriceBreakdown;
  details: {
    trainId: number;
    trainNumber: string;
    trainName: string;
    fromStation: string;
    toStation: string;
    distance: number;
    distanceForPricing: number;
    bogie: string;
    class: number;
    hasAC: boolean;
    isSleeper: boolean;
    berthType?: string;
  };
  calculations: {
    distanceFareCalculation: string;
    trainFareCalculation: string;
    acFareCalculation: string;
    berthFareCalculation: string;
  };
}

/**
 * Calculate distance-based fare
 */
async function calculateDistanceFare(
  classNumber: number,
  distanceKm: number
): Promise<{ fare: number; calculation: string }> {
  logger.debug(
    `Calculating distance fare for class ${classNumber}, distance ${distanceKm} km`,
    'Pricing Engine'
  );

  // Find distance fare configuration for this class
  const distanceFare = await prisma.distanceFare.findFirst({
    where: {
      classNumber,
      isActive: true,
    },
    include: {
      distanceFareRanges: {
        orderBy: { minKm: 'asc' },
      },
    },
  });

  if (!distanceFare || distanceFare.distanceFareRanges.length === 0) {
    logger.warn(
      `No distance fare found for class ${classNumber}`,
      'Pricing Engine'
    );
    return { fare: 0, calculation: 'No distance fare configured' };
  }

  // Find applicable range
  const range = distanceFare.distanceFareRanges.find(
    (r) =>
      Number(r.minKm) <= distanceKm &&
      (r.maxKm === null || Number(r.maxKm) >= distanceKm)
  );

  if (!range) {
    logger.warn(
      `No matching range found for distance ${distanceKm} km in class ${classNumber}`,
      'Pricing Engine'
    );
    return { fare: 0, calculation: 'Distance out of range' };
  }

  let fare = 0;
  let calculation = '';

  if (range.farePerKm) {
    // Calculate based on per-km rate
    const ratePerKm = Number(range.farePerKm);
    fare = distanceKm * ratePerKm;
    calculation = `${distanceKm} km × ${ratePerKm} ฿/km = ${fare.toFixed(2)} ฿`;
  } else if (range.flatRate) {
    // Use flat rate
    fare = Number(range.flatRate);
    calculation = `Flat rate for ${Number(range.minKm)}-${range.maxKm ? Number(range.maxKm) : '∞'} km = ${fare.toFixed(2)} ฿`;
  }

  // Round to 2 decimal places
  fare = Math.round(fare * 100) / 100;

  logger.debug(`Distance fare calculated: ${fare} ฿`, 'Pricing Engine');

  return { fare, calculation };
}

/**
 * Calculate train type fare surcharge
 */
async function calculateTrainFare(
  trainId: number,
  classNumber: number
): Promise<{ fare: number; calculation: string }> {
  logger.debug(
    `Calculating train fare for train ${trainId}, class ${classNumber}`,
    'Pricing Engine'
  );

  const train = await prisma.train.findUnique({
    where: { id: trainId },
    include: {
      trainType: {
        include: {
          trainFares: {
            where: {
              classNumber,
              isActive: true,
            },
          },
        },
      },
    },
  });

  if (!train || !train.trainType) {
    return { fare: 0, calculation: 'No train type configured' };
  }

  const trainFare = train.trainType.trainFares[0];

  if (!trainFare) {
    // Use base fare from train type if no specific fare configured
    const baseFare = Number(train.trainType.baseFare || 0);
    return {
      fare: baseFare,
      calculation: `Base fare for ${train.trainType.nameTh} = ${baseFare.toFixed(2)} ฿`,
    };
  }

  const fare = Number(trainFare.fareValue);
  const calculation = `${trainFare.fareTh} = ${fare.toFixed(2)} ฿`;

  logger.debug(`Train fare calculated: ${fare} ฿`, 'Pricing Engine');

  return { fare, calculation };
}

/**
 * Calculate AC (air conditioning) fare surcharge
 */
async function calculateACFare(
  bogieId: number,
  distanceKm: number
): Promise<{ fare: number; calculation: string }> {
  logger.debug(
    `Calculating AC fare for bogie ${bogieId}, distance ${distanceKm} km`,
    'Pricing Engine'
  );

  const bogie = await prisma.bogie.findUnique({
    where: { id: bogieId },
  });

  if (!bogie || !bogie.hasAC) {
    return { fare: 0, calculation: 'Non-AC bogie' };
  }

  // Try to find bogie-specific AC fare first
  const bogieACFare = await prisma.bogieACFare.findFirst({
    where: {
      bogieId,
      minKm: { lte: new Decimal(distanceKm) },
      OR: [{ maxKm: { gte: new Decimal(distanceKm) } }, { maxKm: null }],
    },
    orderBy: { minKm: 'desc' },
  });

  if (bogieACFare) {
    const fare = Number(bogieACFare.acFare);
    const calculation = `Bogie-specific AC fare (${Number(bogieACFare.minKm)}-${bogieACFare.maxKm ? Number(bogieACFare.maxKm) : '∞'} km) = ${fare.toFixed(2)} ฿`;
    logger.debug(`AC fare (bogie-specific) calculated: ${fare} ฿`, 'Pricing Engine');
    return { fare, calculation };
  }

  // Fallback to category-based AC fare
  const categoryFare = await prisma.aCFare.findFirst({
    where: {
      minKm: { lte: new Decimal(distanceKm) },
      OR: [{ maxKm: { gte: new Decimal(distanceKm) } }, { maxKm: null }],
    },
    include: {
      acFareCategory: true,
    },
    orderBy: { minKm: 'desc' },
  });

  if (categoryFare) {
    const fare = Number(categoryFare.fareAmount);
    const calculation = `AC fare (${categoryFare.acFareCategory.nameTh}, ${Number(categoryFare.minKm)}-${categoryFare.maxKm ? Number(categoryFare.maxKm) : '∞'} km) = ${fare.toFixed(2)} ฿`;
    logger.debug(`AC fare (category) calculated: ${fare} ฿`, 'Pricing Engine');
    return { fare, calculation };
  }

  logger.warn(`No AC fare found for bogie ${bogieId} at ${distanceKm} km`, 'Pricing Engine');
  return { fare: 0, calculation: 'No AC fare configured' };
}

/**
 * Calculate berth (sleeping) fare surcharge
 */
async function calculateBerthFare(
  bogieId: number,
  distanceKm: number,
  berthType?: 'upper' | 'lower' | 'single'
): Promise<{ fare: number; calculation: string }> {
  if (!berthType) {
    return { fare: 0, calculation: 'No berth selected' };
  }

  logger.debug(
    `Calculating berth fare for bogie ${bogieId}, distance ${distanceKm} km, type ${berthType}`,
    'Pricing Engine'
  );

  const bogie = await prisma.bogie.findUnique({
    where: { id: bogieId },
  });

  if (!bogie || !bogie.isSleeper) {
    return { fare: 0, calculation: 'Non-sleeper bogie' };
  }

  const berthFare = await prisma.berthFare.findFirst({
    where: {
      bogieId,
      berthType,
      minKm: { lte: new Decimal(distanceKm) },
      OR: [{ maxKm: { gte: new Decimal(distanceKm) } }, { maxKm: null }],
    },
    orderBy: { minKm: 'desc' },
  });

  if (!berthFare) {
    logger.warn(
      `No berth fare found for bogie ${bogieId}, type ${berthType} at ${distanceKm} km`,
      'Pricing Engine'
    );
    return { fare: 0, calculation: 'No berth fare configured' };
  }

  const fare = Number(berthFare.fareAmount);
  const calculation = `Berth fare (${berthType}, ${Number(berthFare.minKm)}-${berthFare.maxKm ? Number(berthFare.maxKm) : '∞'} km) = ${fare.toFixed(2)} ฿`;

  logger.debug(`Berth fare calculated: ${fare} ฿`, 'Pricing Engine');

  return { fare, calculation };
}

/**
 * Main pricing engine - Calculate total fare
 */
export async function calculatePrice(
  request: PriceCalculationRequest
): Promise<PriceCalculationResult> {
  logger.info(
    `Calculating price for train ${request.trainId}, stations ${request.fromStationId} → ${request.toStationId}, bogie ${request.bogieId}`,
    'Pricing Engine'
  );

  // Get train details
  const train = await prisma.train.findUnique({
    where: { id: request.trainId },
    include: {
      trainType: true,
      originStation: { select: { nameTh: true } },
      destinationStation: { select: { nameTh: true } },
    },
  });

  if (!train) {
    throw new Error(`Train ${request.trainId} not found`);
  }

  // Get bogie details
  const bogie = await prisma.bogie.findUnique({
    where: { id: request.bogieId },
  });

  if (!bogie) {
    throw new Error(`Bogie ${request.bogieId} not found`);
  }

  // Verify bogie is part of this train
  const composition = await prisma.trainComposition.findFirst({
    where: {
      trainId: request.trainId,
      bogieId: request.bogieId,
      isActive: true,
    },
  });

  if (!composition) {
    throw new Error(`Bogie ${request.bogieId} is not configured for train ${request.trainId}`);
  }

  // Get distance
  const distance = await getRouteDistance(
    request.trainId,
    request.fromStationId,
    request.toStationId
  );

  if (!distance) {
    throw new Error(
      `Distance not found for stations ${request.fromStationId} → ${request.toStationId} on train ${request.trainId}`
    );
  }

  const distanceKm = distance.distanceForPricing;

  // Get station names
  const fromStation = await prisma.station.findUnique({
    where: { id: request.fromStationId },
    select: { nameTh: true },
  });

  const toStation = await prisma.station.findUnique({
    where: { id: request.toStationId },
    select: { nameTh: true },
  });

  // Calculate each fare component
  const distanceFareResult = await calculateDistanceFare(bogie.classNumber, distanceKm);
  const trainFareResult = await calculateTrainFare(request.trainId, bogie.classNumber);
  const acFareResult = await calculateACFare(request.bogieId, distanceKm);
  const berthFareResult = await calculateBerthFare(
    request.bogieId,
    distanceKm,
    request.berthType
  );

  // Calculate totals
  const subtotal =
    distanceFareResult.fare +
    trainFareResult.fare +
    acFareResult.fare +
    berthFareResult.fare;

  // TODO: Apply price adjustments (promotions, discounts, surcharges)
  const adjustments = 0;

  const total = subtotal + adjustments;

  const result: PriceCalculationResult = {
    success: true,
    totalFare: Math.round(total * 100) / 100,
    breakdown: {
      distanceFare: Math.round(distanceFareResult.fare * 100) / 100,
      trainFare: Math.round(trainFareResult.fare * 100) / 100,
      acFare: Math.round(acFareResult.fare * 100) / 100,
      berthFare: Math.round(berthFareResult.fare * 100) / 100,
      subtotal: Math.round(subtotal * 100) / 100,
      adjustments: Math.round(adjustments * 100) / 100,
      total: Math.round(total * 100) / 100,
    },
    details: {
      trainId: train.id,
      trainNumber: train.trainNumber,
      trainName: train.trainNameTh || '',
      fromStation: fromStation?.nameTh || '',
      toStation: toStation?.nameTh || '',
      distance: distance.distanceKm,
      distanceForPricing: distanceKm,
      bogie: bogie.nameTh,
      class: bogie.classNumber,
      hasAC: bogie.hasAC,
      isSleeper: bogie.isSleeper,
      berthType: request.berthType,
    },
    calculations: {
      distanceFareCalculation: distanceFareResult.calculation,
      trainFareCalculation: trainFareResult.calculation,
      acFareCalculation: acFareResult.calculation,
      berthFareCalculation: berthFareResult.calculation,
    },
  };

  logger.info(
    `Price calculated: ${result.totalFare} ฿ (distance: ${result.breakdown.distanceFare}, train: ${result.breakdown.trainFare}, AC: ${result.breakdown.acFare}, berth: ${result.breakdown.berthFare})`,
    'Pricing Engine'
  );

  return result;
}
