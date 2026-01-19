
export enum BerthType {
  UPPER = 'UPPER',
  LOWER = 'LOWER'
}

export enum SeatStatus {
  AVAILABLE = 'AVAILABLE',
  OCCUPIED = 'OCCUPIED',
  SELECTED = 'SELECTED'
}

export interface Station {
  id: string;
  name: string;
  timeOffset: number; // minutes from start
}

export interface Seat {
  id: string;
  number: string;
  type: BerthType;
  price: number;
  status: SeatStatus;
}

export interface Meal {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: 'Veg' | 'Non-Veg' | 'Jain';
}

export interface Booking {
  id: string;
  seatId: string;
  fromStationId: string;
  toStationId: string;
  passengerName: string;
  mealId?: string;
  bookingDate: string;
  status: 'Confirmed' | 'Cancelled';
  totalAmount: number;
}

export interface PredictionFeatures {
  leadTimeDays: number;
  dayOfWeek: number;
  currentOccupancy: number;
}
