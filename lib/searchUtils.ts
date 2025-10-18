import { trains, getStationById } from './trainData';
import { Train, SearchParams } from './types';
import { z } from 'zod';

// Validation schema
export const searchSchema = z.object({
  origin: z.string().min(1, 'กรุณาเลือกสถานีต้นทาง'),
  destination: z.string().min(1, 'กรุณาเลือกสถานีปลายทาง'),
}).refine(
  (data) => data.origin !== data.destination,
  {
    message: 'สถานีต้นทางและปลายทางต้องไม่เหมือนกัน',
    path: ['destination'],
  }
);

export type SearchFormData = z.infer<typeof searchSchema>;

// Search trains function
export const searchTrains = (params: SearchParams): Train[] => {
  const { origin, destination } = params;

  // Filter trains by origin and destination
  const results = trains.filter(train => {
    // Direct route
    if (train.origin === origin && train.destination === destination) {
      return true;
    }

    // Check if route includes both stations in correct order
    const allStops = [train.origin, ...train.stops, train.destination];
    const originIndex = allStops.indexOf(origin);
    const destIndex = allStops.indexOf(destination);

    return originIndex !== -1 && destIndex !== -1 && originIndex < destIndex;
  });

  // Sort by departure time
  return results.sort((a, b) => {
    const timeA = a.departureTime.split(':').map(Number);
    const timeB = b.departureTime.split(':').map(Number);

    const hourA = timeA[0] ?? 0;
    const hourB = timeB[0] ?? 0;
    const minA = timeA[1] ?? 0;
    const minB = timeB[1] ?? 0;

    if (hourA !== hourB) {
      return hourA - hourB;
    }
    return minA - minB;
  });
};

// Calculate total price for passengers
export const calculateTotalPrice = (pricePerPerson: number, passengers: number): number => {
  return pricePerPerson * passengers;
};

// Check if enough seats available
export const hasEnoughSeats = (available: number, requested: number): boolean => {
  return available >= requested;
};

// Format price in Thai Baht
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0,
  }).format(price);
};

// Format date in Thai format
export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  }).format(date);
};

// Get availability status
export const getAvailabilityStatus = (available: number, total: number): {
  status: 'high' | 'medium' | 'low';
  percentage: number;
} => {
  const percentage = (available / total) * 100;

  if (percentage > 50) {
    return { status: 'high', percentage };
  } else if (percentage > 20) {
    return { status: 'medium', percentage };
  } else {
    return { status: 'low', percentage };
  }
};
