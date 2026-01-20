import { INITIAL_SEATS, STATIONS, MEALS } from '../constants';
import { Seat, Booking, SeatStatus, Meal, Station, SeatMealSelection } from '../types';

const DB_KEY = 'sleeper_swift_db';
const SEATS_KEY = 'sleeper_swift_seats';

class BusService {
  private seats: Seat[] = [];
  private bookings: Booking[] = [];

  constructor() {
    this.initDatabase();
  }

  private initDatabase() {
    const savedBookings = localStorage.getItem(DB_KEY);
    const savedSeats = localStorage.getItem(SEATS_KEY);

    if (savedBookings) {
      this.bookings = JSON.parse(savedBookings);
    }

    if (savedSeats) {
      this.seats = JSON.parse(savedSeats);
    } else {
      this.seats = [...INITIAL_SEATS];
      this.saveSeats();
    }
  }

  private saveBookings() {
    localStorage.setItem(DB_KEY, JSON.stringify(this.bookings));
  }

  private saveSeats() {
    localStorage.setItem(SEATS_KEY, JSON.stringify(this.seats));
  }

  async syncData(): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const available = this.seats.filter(s => s.status === SeatStatus.AVAILABLE);
        if (available.length > 2) {
            available[0].status = SeatStatus.OCCUPIED;
            available[1].status = SeatStatus.OCCUPIED;
            this.saveSeats();
        }
        resolve();
      }, 1500);
    });
  }

  async getStations(): Promise<Station[]> {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...STATIONS]), 150);
    });
  }

  async getSeats(): Promise<Seat[]> {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...this.seats]), 300);
    });
  }

  async getMeals(): Promise<Meal[]> {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...MEALS]), 200);
    });
  }

  async updateSeatStatus(seatId: string, status: SeatStatus): Promise<void> {
    const index = this.seats.findIndex(s => s.id === seatId);
    if (index !== -1) {
      this.seats[index].status = status;
      this.saveSeats();
    }
  }

  async resetSystem(): Promise<void> {
    this.bookings = [];
    this.seats = [...INITIAL_SEATS];
    this.saveBookings();
    this.saveSeats();
  }

  async createBooking(data: {
    seatIds: string[];
    fromStationId: string;
    toStationId: string;
    passengerName: string;
    seatMeals: SeatMealSelection[];
  }): Promise<Booking> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const targetSeatIndices = data.seatIds.map(id => this.seats.findIndex(s => s.id === id));
        
        const isAnyOccupied = targetSeatIndices.some(idx => idx === -1 || this.seats[idx].status === SeatStatus.OCCUPIED);
        
        if (isAnyOccupied) {
          reject(new Error("One or more selected seats are already occupied."));
          return;
        }

        // Fixed: Explicitly typed the reduce parameters to avoid potential 'unknown' errors
        const seatsPrice = targetSeatIndices.reduce((acc: number, idx: number) => {
          const seat = this.seats[idx];
          return acc + (seat ? seat.price : 0);
        }, 0);
        
        // Calculate total meal price from the seatMeals array
        // Fixed: Added explicit type annotations to reduce callback
        const mealsPrice = data.seatMeals.reduce((acc: number, sm: SeatMealSelection) => {
          const meal = MEALS.find(m => m.id === sm.mealId);
          return acc + (meal?.price || 0);
        }, 0);

        const totalAmount = seatsPrice + mealsPrice;

        const newBooking: Booking = {
          id: `BK${Math.floor(Math.random() * 900000) + 100000}`,
          ...data,
          bookingDate: new Date().toISOString(),
          status: 'Confirmed',
          totalAmount
        };

        // Update all seats to occupied
        targetSeatIndices.forEach(idx => {
          this.seats[idx] = { ...this.seats[idx], status: SeatStatus.OCCUPIED };
        });

        this.bookings.push(newBooking);
        
        this.saveSeats();
        this.saveBookings();
        
        resolve(newBooking);
      }, 800);
    });
  }

  async cancelBooking(bookingId: string): Promise<boolean> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = this.bookings.findIndex(b => b.id === bookingId);
        if (index === -1) return resolve(false);

        const booking = this.bookings[index];
        
        // Release all seats in the booking
        booking.seatIds.forEach(seatId => {
          const seatIndex = this.seats.findIndex(s => s.id === seatId);
          if (seatIndex !== -1) {
            this.seats[seatIndex] = { ...this.seats[seatIndex], status: SeatStatus.AVAILABLE };
          }
        });

        this.bookings[index] = { ...booking, status: 'Cancelled' };
        
        this.saveSeats();
        this.saveBookings();
        
        resolve(true);
      }, 1000);
    });
  }

  async getBookingHistory(): Promise<Booking[]> {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...this.bookings]), 200);
    });
  }
}

export const busService = new BusService();