
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Info, ChevronRight, Utensils, IndianRupee, User, BrainCircuit, Calendar, MapPin, AlertCircle, ShoppingCart, ArrowLeft, ArrowRight } from 'lucide-react';
import { busService } from '../services/busService';
import { predictConfirmationProbability } from '../services/mlService';
// Fix: Import types from types.ts and values/constants from constants.ts
import { Seat, BerthType, SeatStatus, Meal } from '../types';
import { STATIONS } from '../constants';

const BookingPage: React.FC = () => {
  const { from, to } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const bookingDate = searchParams.get('date') || new Date().toISOString().split('T')[0];

  const [seats, setSeats] = useState<Seat[]>([]);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [passengerName, setPassengerName] = useState('');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [bookedInfo, setBookedInfo] = useState<any>(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([busService.getSeats(), busService.getMeals()]).then(([s, m]) => {
      setSeats(s);
      setMeals(m);
      setLoading(false);
    });
  }, []);

  const fromStation = STATIONS.find(s => s.id === from);
  const toStation = STATIONS.find(s => s.id === to);

  const occupancy = useMemo(() => {
    if (seats.length === 0) return 0;
    return (seats.filter(s => s.status === SeatStatus.OCCUPIED).length / seats.length) * 100;
  }, [seats]);

  const confirmationProb = useMemo(() => {
    const today = new Date();
    const travelDate = new Date(bookingDate);
    const diffDays = Math.max(0, Math.ceil((travelDate.getTime() - today.getTime()) / (1000 * 3600 * 24)));
    
    return predictConfirmationProbability({
      leadTimeDays: diffDays,
      dayOfWeek: travelDate.getDay(),
      currentOccupancy: occupancy
    });
  }, [bookingDate, occupancy]);

  const handleBooking = async () => {
    if (!selectedSeat || !passengerName.trim()) {
        alert("Please provide required details.");
        return;
    }
    setLoading(true);
    try {
      const result = await busService.createBooking({
        seatId: selectedSeat.id,
        fromStationId: from!,
        toStationId: to!,
        passengerName,
        mealId: selectedMeal?.id
      });
      setBookedInfo(result);
      setStep(4);
    } catch (err) {
      alert("Booking failed: " + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const getProbColor = (p: number) => {
    if (p > 90) return 'text-green-600';
    if (p > 75) return 'text-blue-600';
    return 'text-amber-600';
  };

  const lowerBerths = seats.filter(s => s.type === BerthType.LOWER);
  const upperBerths = seats.filter(s => s.type === BerthType.UPPER);

  if (loading && step === 1) {
    return <div className="h-96 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 animate-in fade-in duration-500">
      {/* Route Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <div className="text-center">
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Origin</p>
            <p className="text-xl font-bold">{fromStation?.name}</p>
          </div>
          <div className="h-px w-12 bg-slate-200 relative">
            <div className="absolute -top-1 right-0 w-2 h-2 rounded-full bg-blue-500"></div>
          </div>
          <div className="text-center">
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Destination</p>
            <p className="text-xl font-bold">{toStation?.name}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Date</p>
          <p className="text-lg font-medium">{bookingDate}</p>
        </div>
      </div>

      {/* Progress Steps */}
      {step < 4 && (
        <div className="flex items-center justify-center gap-2 md:gap-4">
            {[1, 2, 3].map((s) => (
            <React.Fragment key={s}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${step === s ? 'bg-blue-600 text-white shadow-lg ring-4 ring-blue-50' : step > s ? 'bg-green-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                {step > s ? <CheckCircle size={18} /> : s}
                </div>
                {s < 3 && <div className={`h-1 w-8 md:w-16 rounded ${step > s ? 'bg-green-500' : 'bg-slate-200'}`}></div>}
            </React.Fragment>
            ))}
        </div>
      )}

      {/* Prediction Banner */}
      {step < 4 && (
        <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex items-center gap-4">
          <div className="bg-blue-600 p-2 rounded-lg">
            <BrainCircuit className="text-white" size={20} />
          </div>
          <div>
            <p className="text-sm font-semibold text-blue-900">AI Confirmation Predictor</p>
            <p className="text-sm text-blue-700">
              Your booking has a <span className={`font-bold ${getProbColor(confirmationProb)}`}>{confirmationProb}% probability</span> of confirmation based on current demand.
            </p>
          </div>
        </div>
      )}

      {/* Step Contents */}
      {step === 1 && (
        <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Select Seat</h2>
            <div className="flex gap-4 text-xs font-semibold">
              <span className="flex items-center gap-1"><div className="w-3 h-3 bg-white border border-slate-300"></div> Available</span>
              <span className="flex items-center gap-1"><div className="w-3 h-3 bg-slate-200"></div> Taken</span>
              <span className="flex items-center gap-1"><div className="w-3 h-3 bg-blue-600"></div> Choice</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Lower Deck</h3>
              <div className="grid grid-cols-3 gap-3 p-4 bg-slate-50 rounded-2xl border-2 border-slate-100">
                {lowerBerths.map(seat => (
                  <button
                    key={seat.id}
                    disabled={seat.status === SeatStatus.OCCUPIED}
                    onClick={() => setSelectedSeat(seat)}
                    className={`h-12 flex items-center justify-center rounded-lg border-2 transition-all font-bold ${
                      selectedSeat?.id === seat.id 
                        ? 'bg-blue-600 border-blue-600 text-white scale-105' 
                        : seat.status === SeatStatus.OCCUPIED 
                          ? 'bg-slate-200 border-slate-200 text-slate-400 cursor-not-allowed'
                          : 'bg-white border-slate-200 hover:border-blue-400 text-slate-700'
                    }`}
                  >
                    {seat.number}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Upper Deck</h3>
              <div className="grid grid-cols-3 gap-3 p-4 bg-slate-50 rounded-2xl border-2 border-slate-100">
                {upperBerths.map(seat => (
                  <button
                    key={seat.id}
                    disabled={seat.status === SeatStatus.OCCUPIED}
                    onClick={() => setSelectedSeat(seat)}
                    className={`h-12 flex items-center justify-center rounded-lg border-2 transition-all font-bold ${
                      selectedSeat?.id === seat.id 
                        ? 'bg-blue-600 border-blue-600 text-white scale-105' 
                        : seat.status === SeatStatus.OCCUPIED 
                          ? 'bg-slate-200 border-slate-200 text-slate-400 cursor-not-allowed'
                          : 'bg-white border-slate-200 hover:border-blue-400 text-slate-700'
                    }`}
                  >
                    {seat.number}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button 
              disabled={!selectedSeat}
              onClick={() => setStep(2)}
              className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl disabled:opacity-50 flex items-center gap-2 hover:bg-blue-700 transition-colors"
            >
              Continue to Meals <ArrowRight size={18} />
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
          <h2 className="text-2xl font-bold">Select Meal Add-on</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {meals.map(meal => (
              <div 
                key={meal.id} 
                onClick={() => setSelectedMeal(selectedMeal?.id === meal.id ? null : meal)}
                className={`group cursor-pointer p-4 rounded-2xl border-2 transition-all ${
                  selectedMeal?.id === meal.id ? 'border-blue-600 bg-blue-50/50' : 'border-slate-100 bg-white hover:border-blue-200'
                }`}
              >
                <div className="flex gap-4">
                  <img src={meal.image} alt={meal.name} className="w-24 h-24 rounded-xl object-cover" />
                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between items-start">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                        meal.category === 'Veg' ? 'bg-green-100 text-green-700' : 
                        meal.category === 'Jain' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {meal.category}
                      </span>
                      <span className="font-bold text-slate-900">₹{meal.price}</span>
                    </div>
                    <h3 className="font-bold text-slate-800">{meal.name}</h3>
                    <p className="text-xs text-slate-500 line-clamp-2">{meal.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex justify-between items-center mt-8">
            <button 
              onClick={() => setStep(1)}
              className="flex items-center gap-2 text-slate-600 font-semibold hover:text-slate-900"
            >
              <ArrowLeft size={18} /> Back to Seats
            </button>
            <button 
              onClick={() => setStep(3)}
              className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl flex items-center gap-2 hover:bg-blue-700 transition-colors"
            >
              Passenger Info <ArrowRight size={18} />
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
          <h2 className="text-2xl font-bold">Review & Passenger Info</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-100 space-y-4">
                <label className="block space-y-2">
                  <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Passenger Full Name</span>
                  <input 
                    type="text" 
                    value={passengerName}
                    onChange={(e) => setPassengerName(e.target.value)}
                    placeholder="Enter full name"
                    className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                </label>
              </div>

              <div className="bg-slate-900 text-white p-6 rounded-2xl space-y-4 shadow-xl">
                <h3 className="font-bold flex items-center gap-2"><ShoppingCart size={18} /> Booking Summary</h3>
                <div className="space-y-2 text-sm text-slate-400">
                  <div className="flex justify-between">
                    <span>Seat {selectedSeat?.number} ({selectedSeat?.type})</span>
                    <span className="text-white">₹{selectedSeat?.price}</span>
                  </div>
                  {selectedMeal && (
                    <div className="flex justify-between">
                      <span>Meal: {selectedMeal.name}</span>
                      <span className="text-white">₹{selectedMeal.price}</span>
                    </div>
                  )}
                  <div className="pt-4 border-t border-slate-800 flex justify-between text-lg font-bold text-white">
                    <span>Total Amount</span>
                    <span>₹{(selectedSeat?.price || 0) + (selectedMeal?.price || 0)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl space-y-3">
                <div className="flex items-center gap-2 text-amber-800 font-bold text-sm">
                  <AlertCircle size={16} /> Important Note
                </div>
                <p className="text-xs text-amber-700 leading-relaxed">
                  Bookings are subject to verification. Please arrive at the station 30 minutes before departure time.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center mt-8">
            <button 
              onClick={() => setStep(2)}
              className="flex items-center gap-2 text-slate-600 font-semibold hover:text-slate-900"
            >
              <ArrowLeft size={18} /> Back to Meals
            </button>
            <button 
              disabled={loading || !passengerName.trim()}
              onClick={handleBooking}
              className="px-10 py-4 bg-blue-600 text-white font-bold rounded-xl flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20 disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Confirm Booking'}
            </button>
          </div>
        </div>
      )}

      {step === 4 && bookedInfo && (
        <div className="bg-white p-12 rounded-3xl border border-slate-100 text-center space-y-8 shadow-xl animate-in zoom-in duration-500">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto ring-8 ring-green-50">
            <CheckCircle size={40} />
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-extrabold text-slate-900">Booking Confirmed!</h2>
            <p className="text-slate-500">Your ticket ID is <span className="font-bold text-slate-900">#{bookedInfo.id}</span></p>
          </div>

          <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto text-left bg-slate-50 p-6 rounded-2xl border border-slate-100">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Passenger</p>
              <p className="font-bold">{bookedInfo.passengerName}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Seat</p>
              <p className="font-bold">{selectedSeat?.number}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">From</p>
              <p className="font-bold">{fromStation?.name}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">To</p>
              <p className="font-bold">{toStation?.name}</p>
            </div>
          </div>

          <button 
            onClick={() => navigate('/dashboard')}
            className="px-8 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      )}
    </div>
  );
};

export default BookingPage;
