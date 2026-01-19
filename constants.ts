
import { Station, Seat, BerthType, SeatStatus, Meal } from './types';

export const STATIONS: Station[] = [
  { id: '1', name: 'Ahmedabad (Gita Mandir)', timeOffset: 0 },
  { id: '2', name: 'Vadodara (Golden Chokdi)', timeOffset: 120 },
  { id: '3', name: 'Surat (Kamrej)', timeOffset: 300 },
  { id: '4', name: 'Vapi (GIDC)', timeOffset: 480 },
  { id: '5', name: 'Mumbai (Borivali)', timeOffset: 660 },
];

const generateSeats = (): Seat[] => {
  const seats: Seat[] = [];
  // 15 lower, 15 upper
  for (let i = 1; i <= 15; i++) {
    seats.push({
      id: `L${i}`,
      number: `L${i}`,
      type: BerthType.LOWER,
      price: 1200,
      status: Math.random() > 0.8 ? SeatStatus.OCCUPIED : SeatStatus.AVAILABLE
    });
    seats.push({
      id: `U${i}`,
      number: `U${i}`,
      type: BerthType.UPPER,
      price: 1100,
      status: Math.random() > 0.8 ? SeatStatus.OCCUPIED : SeatStatus.AVAILABLE
    });
  }
  return seats;
};

export const INITIAL_SEATS = generateSeats();

export const MEALS: Meal[] = [
  {
    id: 'm1',
    name: 'Classic Gujarati Thali',
    description: 'Rotli, Dal, Shaak, Rice, and Sweet. Authentic local taste.',
    price: 250,
    image: 'https://share.google/images/krbtfsGlQyBEcA6RQ',
    category: 'Veg'
  },
  {
    id: 'm2',
    name: 'Mumbai Pav Bhaji',
    description: 'Buttery spicy mash served with two soft pavs.',
    price: 180,
    image: 'https://images.unsplash.com/photo-1626132646529-500337552978?auto=format&fit=crop&q=80&w=800',
    category: 'Veg'
  },
  {
    id: 'm3',
    name: 'Butter Chicken Meal',
    description: 'Creamy butter chicken with 2 butter naans.',
    price: 320,
    image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&q=80&w=800',
    category: 'Non-Veg'
  },
  {
    id: 'm4',
    name: 'Jain Special Thali',
    description: 'No onion, no garlic, root-free traditional meal.',
    price: 260,
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&q=80&w=800',
    category: 'Jain'
  }
];
