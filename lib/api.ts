// API Service Layer - Frontend calls to backend

import type { Station, Train, SearchParams } from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

/**
 * Fetch all stations
 */
export async function fetchStations(region?: string): Promise<Station[]> {
  try {
    const url = region 
      ? `${API_BASE}/api/stations?region=${encodeURIComponent(region)}`
      : `${API_BASE}/api/stations`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch stations');
    }
    
    return data.data || [];
  } catch (error) {
    console.error('Error fetching stations:', error);
    throw error;
  }
}

/**
 * Search trains
 */
export async function searchTrains(params: SearchParams): Promise<Train[]> {
  try {
    const response = await fetch(`${API_BASE}/api/trains/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        origin: params.origin,
        destination: params.destination,
        // date and passengers can be used for future filtering
        date: params.date,
        passengers: params.passengers,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || data.message || 'Failed to search trains');
    }
    
    return data.data || [];
  } catch (error) {
    console.error('Error searching trains:', error);
    throw error;
  }
}

/**
 * Get train details by ID
 */
export async function getTrainDetails(trainId: string): Promise<any> {
  try {
    const response = await fetch(`${API_BASE}/api/trains/${trainId}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch train details');
    }
    
    return data.data;
  } catch (error) {
    console.error('Error fetching train details:', error);
    throw error;
  }
}

/**
 * Calculate fare
 */
export async function calculateFare(
  trainId: string,
  origin: string,
  destination: string,
  classType: string = '2'
): Promise<{
  distance: number;
  baseFare: number;
  trainFee: number;
  acFee: number;
  sleeperFee: number;
  totalFare: number;
  currency: string;
}> {
  try {
    const response = await fetch(`${API_BASE}/api/fare/calculate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        trainId,
        origin,
        destination,
        classType,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to calculate fare');
    }
    
    return data.data;
  } catch (error) {
    console.error('Error calculating fare:', error);
    throw error;
  }
}

/**
 * Get popular trains
 */
export async function getPopularTrains(limit: number = 10): Promise<any[]> {
  try {
    const response = await fetch(`${API_BASE}/api/popular-trains?limit=${limit}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch popular trains');
    }
    
    return data.data || [];
  } catch (error) {
    console.error('Error fetching popular trains:', error);
    throw error;
  }
}

/**
 * Log search (for analytics)
 */
export async function logSearch(
  trainId?: string,
  originId?: string,
  destinationId?: string
): Promise<void> {
  try {
    // This would be implemented if we create the endpoint
    // For now, we can skip logging on client side
    console.log('Search logged:', { trainId, originId, destinationId });
  } catch (error) {
    console.error('Error logging search:', error);
    // Don't throw - logging failures shouldn't break the app
  }
}
