
import { INITIAL_SEATS, STATIONS, MEALS } from '../constants';
import { Seat, Booking, SeatStatus } from '../types';

class BusService {
  private seats: Seat[] = [...INITIAL_SEATS];
  private bookings: Booking[] = [];

  async getSeats(): Promise<Seat[]> {
    return new Promise((resolve) => {
      setTimeout(() => resolve(this.seats), 300);
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

        this.seats[seatIndex] = { ...this.seats[seatIndex], status: SeatStatus.OCCUPIED };
        this.bookings.push(newBooking);
        resolve(newBooking);
      }, 800);
    });
  }

  async cancelBooking(bookingId: string): Promise<boolean> {
    const index = this.bookings.findIndex(b => b.id === bookingId);
    if (index === -1) return false;

    const booking = this.bookings[index];
    const seatIndex = this.seats.findIndex(s => s.id === booking.seatId);
    if (seatIndex !== -1) {
      this.seats[seatIndex] = { ...this.seats[seatIndex], status: SeatStatus.AVAILABLE };
    }

    this.bookings[index] = { ...booking, status: 'Cancelled' };
    return true;
  }

  async getBookingHistory(): Promise<Booking[]> {
    return this.bookings;
  }
}

export const busService = new BusService();
