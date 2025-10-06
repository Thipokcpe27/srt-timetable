// Station types
export interface Station {
  id: string;
  name: string;
  code: string;
  city: string;
  region: string;
}

// Train class types
export interface TrainClass {
  id: string;
  name: string;
  price: number;
  features: string[];
  available: number;
  totalSeats: number;
}

// Amenity types
export interface Amenity {
  id: string;
  name: string;
  icon: string;
  available: boolean;
}

// Train types
export interface Train {
  id: string;
  trainNumber: string;
  trainName: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  stops: string[];
  classes: TrainClass[];
  amenities: Amenity[];
  operatingDays: string[];
}

// Search parameters
export interface SearchParams {
  origin: string;
  destination: string;
}

// Search result
export interface SearchResult {
  trains: Train[];
  searchParams: SearchParams;
}
