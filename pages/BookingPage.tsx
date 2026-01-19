
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Info, ChevronRight, Utensils, IndianRupee, User, BrainCircuit, Calendar, MapPin, AlertCircle, ShoppingCart, ArrowLeft, ArrowRight, Leaf, Bone, Heart, Bed, HelpCircle } from 'lucide-react';
import { busService } from '../services/busService';
import { predictConfirmationProbability } from '../services/mlService';
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
  const [activeMealTab, setActiveMealTab] = useState<'All' | 'Veg' | 'Non-Veg' | 'Jain'>('All');
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

  const filteredMeals = useMemo(() => {
    if (activeMealTab === 'All') return meals;
    return meals.filter(m => m.category === activeMealTab);
  }, [meals, activeMealTab]);

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
        <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Choose Your Comfort</h2>
              <p className="text-sm text-slate-500">Select a berth from the layout below.</p>
            </div>
            <div className="flex flex-wrap gap-4 text-[10px] font-bold uppercase tracking-wider">
              <span className="flex items-center gap-2 px-2 py-1 bg-white border border-slate-200 rounded-md">
                <div className="w-2.5 h-2.5 bg-white border border-slate-300 rounded-sm"></div> Available
              </span>
              <span className="flex items-center gap-2 px-2 py-1 bg-slate-100 text-slate-400 border border-slate-200 rounded-md">
                <div className="w-2.5 h-2.5 bg-slate-200 rounded-sm"></div> Occupied
              </span>
              <span className="flex items-center gap-2 px-2 py-1 bg-blue-50 text-blue-600 border border-blue-100 rounded-md">
                <div className="w-2.5 h-2.5 bg-blue-600 rounded-sm"></div> Selected
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Lower Deck */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Lower Deck</h3>
                <div className="group relative flex items-center gap-1.5 text-[10px] text-blue-500 font-bold bg-blue-50 px-2 py-1 rounded-full cursor-help">
                  <HelpCircle size={12} /> Easy Access
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-800 text-white rounded-lg text-[10px] font-medium opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-xl">
                    Ideal for elderly, children, or those who prefer not to climb. Near the exit.
                  </div>
                </div>
              </div>
              
              <div className="relative p-6 bg-white rounded-3xl border-2 border-slate-100 shadow-sm">
                {/* Bus Front Indicator */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-slate-100 text-slate-400 px-4 py-1 rounded-full text-[10px] font-bold border-2 border-white">
                  FRONT / DRIVER
                </div>
                
                <div className="grid grid-cols-3 gap-4 pt-2">
                  {lowerBerths.map(seat => (
                    <button
                      key={seat.id}
                      disabled={seat.status === SeatStatus.OCCUPIED}
                      onClick={() => setSelectedSeat(seat)}
                      className={`h-16 relative flex flex-col items-center justify-center rounded-xl border-2 transition-all group ${
                        selectedSeat?.id === seat.id 
                          ? 'bg-blue-600 border-blue-600 text-white scale-110 shadow-lg shadow-blue-500/30 ring-4 ring-blue-100' 
                          : seat.status === SeatStatus.OCCUPIED 
                            ? 'bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed opacity-60'
                            : 'bg-white border-slate-100 hover:border-blue-400 hover:bg-blue-50 text-slate-700'
                      }`}
                    >
                      <Bed size={14} className={`mb-1 ${selectedSeat?.id === seat.id ? 'text-blue-200' : 'text-slate-300 group-hover:text-blue-400'}`} />
                      <span className="text-xs font-black">{seat.number}</span>
                      {selectedSeat?.id === seat.id && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full flex items-center justify-center">
                           <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-ping" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Upper Deck */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Upper Deck</h3>
                <div className="group relative flex items-center gap-1.5 text-[10px] text-purple-500 font-bold bg-purple-50 px-2 py-1 rounded-full cursor-help">
                  <HelpCircle size={12} /> Extra Privacy
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-800 text-white rounded-lg text-[10px] font-medium opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-xl">
                    Better views and more privacy from the aisle. Recommended for solo travelers.
                  </div>
                </div>
              </div>

              <div className="relative p-6 bg-white rounded-3xl border-2 border-slate-100 shadow-sm">
                 {/* Bus Front Indicator */}
                 <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-slate-100 text-slate-400 px-4 py-1 rounded-full text-[10px] font-bold border-2 border-white">
                  FRONT / DRIVER
                </div>

                <div className="grid grid-cols-3 gap-4 pt-2">
                  {upperBerths.map(seat => (
                    <button
                      key={seat.id}
                      disabled={seat.status === SeatStatus.OCCUPIED}
                      onClick={() => setSelectedSeat(seat)}
                      className={`h-16 relative flex flex-col items-center justify-center rounded-xl border-2 transition-all group ${
                        selectedSeat?.id === seat.id 
                          ? 'bg-blue-600 border-blue-600 text-white scale-110 shadow-lg shadow-blue-500/30 ring-4 ring-blue-100' 
                          : seat.status === SeatStatus.OCCUPIED 
                            ? 'bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed opacity-60'
                            : 'bg-white border-slate-100 hover:border-blue-400 hover:bg-blue-50 text-slate-700'
                      }`}
                    >
                      <Bed size={14} className={`mb-1 ${selectedSeat?.id === seat.id ? 'text-blue-200' : 'text-slate-300 group-hover:text-blue-400'}`} />
                      <span className="text-xs font-black">{seat.number}</span>
                      {selectedSeat?.id === seat.id && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full flex items-center justify-center">
                           <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-ping" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-6 bg-slate-900 rounded-3xl text-white shadow-xl shadow-slate-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                <Bed className="text-blue-400" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Selected Seat</p>
                <p className="text-xl font-black">{selectedSeat ? `Seat ${selectedSeat.number}` : 'None selected'}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Base Fare</p>
                <p className="text-xl font-black text-blue-400">₹{selectedSeat?.price || 0}</p>
              </div>
              <button 
                disabled={!selectedSeat}
                onClick={() => setStep(2)}
                className="ml-4 px-8 py-4 bg-blue-600 text-white font-bold rounded-2xl disabled:opacity-50 flex items-center gap-2 hover:bg-blue-700 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-blue-600/30"
              >
                Next: Meals <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-2xl font-bold">Select Meal Add-on</h2>
            
            {/* Category Tabs */}
            <div className="flex p-1 bg-slate-100 rounded-xl">
              {(['All', 'Veg', 'Non-Veg', 'Jain'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveMealTab(cat)}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
                    activeMealTab === cat 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {cat === 'Veg' && <Leaf size={14} className="text-green-500" />}
                  {cat === 'Non-Veg' && <Bone size={14} className="text-red-500" />}
                  {cat === 'Jain' && <Heart size={14} className="text-blue-400" />}
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-h-[400px]">
            {filteredMeals.length > 0 ? (
              filteredMeals.map(meal => (
                <div 
                  key={meal.id} 
                  onClick={() => setSelectedMeal(selectedMeal?.id === meal.id ? null : meal)}
                  className={`group relative cursor-pointer p-4 rounded-2xl border-2 transition-all hover:shadow-md ${
                    selectedMeal?.id === meal.id ? 'border-blue-600 bg-blue-50/50' : 'border-slate-100 bg-white hover:border-blue-200'
                  }`}
                >
                  {selectedMeal?.id === meal.id && (
                    <div className="absolute -top-2 -right-2 bg-blue-600 text-white p-1 rounded-full shadow-lg z-10">
                      <CheckCircle size={16} />
                    </div>
                  )}
                  <div className="flex gap-4">
                    <div className="relative w-24 h-24 flex-shrink-0">
                      <img src={meal.image} alt={meal.name} className="w-full h-full rounded-xl object-cover" />
                      <div className="absolute top-1 left-1">
                        <span className={`w-3 h-3 rounded-sm border flex items-center justify-center p-0.5 ${
                          meal.category === 'Non-Veg' ? 'border-red-600' : 'border-green-600'
                        }`}>
                          <div className={`w-full h-full rounded-full ${
                            meal.category === 'Non-Veg' ? 'bg-red-600' : 'bg-green-600'
                          }`} />
                        </span>
                      </div>
                    </div>
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
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center text-slate-400 py-12">
                <Utensils size={48} className="mb-4 opacity-20" />
                <p className="font-medium">No meals found in this category</p>
              </div>
            )}
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
