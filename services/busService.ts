
import { INITIAL_SEATS, STATIONS, MEALS } from '../constants';
import { Seat, Booking, SeatStatus } from '../types';

const DB_KEY = 'sleeper_swift_db';
const SEATS_KEY = 'sleeper_swift_seats';

class BusService {
  private seats: Seat[] = [];
  private bookings: Booking[] = [];

  constructor() {
    this.initDatabase();
  }

  private initDatabase() {
    // Load existing data or initialize with defaults
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

  async getSeats(): Promise<Seat[]> {
    return new Promise((resolve) => {
      // Simulate network latency
      setTimeout(() => resolve([...this.seats]), 300);
    });
  }

  async getStations() {
    return STATIONS;
  }

  async getMeals() {
    return MEALS;
  }

  async createBooking(data: {
    seatId: string;
    fromStationId: string;
    toStationId: string;
    passengerName: string;
    mealId?: string;
  }): Promise<Booking> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const seatIndex = this.seats.findIndex(s => s.id === data.seatId);
        
        if (seatIndex === -1 || this.seats[seatIndex].status === SeatStatus.OCCUPIED) {
          reject(new Error("Seat is already occupied or does not exist."));
          return;
        }

        const mealPrice = MEALS.find(m => m.id === data.mealId)?.price || 0;
        const totalAmount = this.seats[seatIndex].price + mealPrice;

        const newBooking: Booking = {
          id: `BK${Math.floor(Math.random() * 900000) + 100000}`,
          ...data,
          bookingDate: new Date().toISOString(),
          status: 'Confirmed',
          totalAmount
        };

        // Update In-Memory and Persistence
        this.seats[seatIndex] = { ...this.seats[seatIndex], status: SeatStatus.OCCUPIED };
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
        const seatIndex = this.seats.findIndex(s => s.id === booking.seatId);
        
        if (seatIndex !== -1) {
          this.seats[seatIndex] = { ...this.seats[seatIndex], status: SeatStatus.AVAILABLE };
        }

        this.bookings[index] = { ...booking, status: 'Cancelled' };
        
        this.saveSeats();
        this.saveBookings();
        
        resolve(true);
      }, 500);
    });
  }

  async getBookingHistory(): Promise<Booking[]> {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...this.bookings]), 200);
    });
  }
}

export const busService = new BusService();
