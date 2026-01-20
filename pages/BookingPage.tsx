
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { 
  CheckCircle, Utensils, IndianRupee, User, BrainCircuit, 
  MapPin, AlertCircle, ShoppingCart, ArrowLeft, ArrowRight, 
  Bed, Clock, Timer, Check, ChevronLeft, ChevronRight, RefreshCw, X,
  Coffee, Salad, Soup, LayoutDashboard, Printer, Download, QrCode
} from 'lucide-react';
import { busService } from '../services/busService';
import { predictConfirmationProbability } from '../services/mlService';
import { Seat, BerthType, SeatStatus, Meal, Station, SeatMealSelection } from '../types';

const BookingPage: React.FC = () => {
  const { from, to } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const bookingDate = searchParams.get('date') || new Date().toISOString().split('T')[0];

  const [seats, setSeats] = useState<Seat[]>([]);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [stations, setStations] = useState<Station[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  const [seatMeals, setSeatMeals] = useState<Record<string, Meal>>({});
  const [passengerName, setPassengerName] = useState('');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [bookedInfo, setBookedInfo] = useState<any>(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      busService.getSeats(), 
      busService.getMeals(),
      busService.getStations()
    ]).then(([s, m, st]) => {
      setSeats(s);
      setMeals(m);
      setStations(st);
      setLoading(false);
    });
  }, []);

  const fromStation = stations.find(s => s.id === from);
  const toStation = stations.find(s => s.id === to);

  const journeyTimings = useMemo(() => {
    if (!fromStation || !toStation) return null;
    const departureBase = new Date(`${bookingDate}T21:00:00`);
    const departureTime = new Date(departureBase.getTime() + fromStation.timeOffset * 60000);
    const arrivalTime = new Date(departureBase.getTime() + toStation.timeOffset * 60000);
    const durationMins = toStation.timeOffset - fromStation.timeOffset;
    return {
      departure: departureTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      arrival: arrivalTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      duration: `${Math.floor(durationMins / 60)}h ${durationMins % 60}m`,
    };
  }, [fromStation, toStation, bookingDate]);

  const confirmationProb = useMemo(() => {
    if (seats.length === 0) return 0;
    const occupancy = (seats.filter(s => s.status === SeatStatus.OCCUPIED).length / seats.length) * 100;
    const today = new Date();
    const travelDate = new Date(bookingDate);
    const diffDays = Math.max(0, Math.ceil((travelDate.getTime() - today.getTime()) / (1000 * 3600 * 24)));
    
    return predictConfirmationProbability({
      leadTimeDays: diffDays,
      dayOfWeek: travelDate.getDay(),
      currentOccupancy: occupancy
    });
  }, [bookingDate, seats]);

  const toggleSeat = (seat: Seat) => {
    if (selectedSeats.find(s => s.id === seat.id)) {
      setSelectedSeats(selectedSeats.filter(s => s.id !== seat.id));
      const newSeatMeals = { ...seatMeals };
      delete newSeatMeals[seat.id];
      setSeatMeals(newSeatMeals);
    } else {
      setSelectedSeats([...selectedSeats, seat]);
    }
  };

  const assignMealToSeat = (seatId: string, meal: Meal | null) => {
    setSeatMeals(prev => {
      const next = { ...prev };
      if (meal) {
        next[seatId] = meal;
      } else {
        delete next[seatId];
      }
      return next;
    });
  };

  const totalSeatsPrice = selectedSeats.reduce((acc, s) => acc + s.price, 0);
  const totalMealsPrice = Object.values(seatMeals).reduce((acc: number, m: Meal) => acc + m.price, 0);
  const totalAmount = totalSeatsPrice + totalMealsPrice;

  const handleBooking = async () => {
    if (!passengerName.trim()) {
      alert("Please enter passenger name");
      return;
    }
    setLoading(true);
    const formattedSeatMeals: SeatMealSelection[] = selectedSeats.map(s => ({
      seatId: s.id,
      mealId: seatMeals[s.id]?.id === 'none' ? undefined : seatMeals[s.id]?.id
    }));

    try {
      const result = await busService.createBooking({
        seatIds: selectedSeats.map(s => s.id),
        fromStationId: from!,
        toStationId: to!,
        passengerName,
        seatMeals: formattedSeatMeals
      });
      setBookedInfo(result);
      setStep(4);
    } catch (err) {
      alert("Booking failed: " + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading && step === 1) return <div className="h-96 flex items-center justify-center"><RefreshCw className="animate-spin text-blue-600" size={32} /></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 animate-in fade-in duration-500">
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #printable-ticket, #printable-ticket * { visibility: visible; }
          #printable-ticket {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 40px;
            background: white !important;
            color: black !important;
          }
          .no-print { display: none !important; }
        }
      `}</style>

      {/* Main UI */}
      <div className="no-print space-y-6">
        {/* Step Header */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-8">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Route</p>
              <p className="text-lg font-bold text-slate-900">{fromStation?.name} <ArrowRight size={14} className="inline mx-1 text-slate-300" /> {toStation?.name}</p>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</p>
              <p className="text-lg font-bold text-slate-900">{bookingDate}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-2xl border border-blue-100">
            <BrainCircuit size={18} className="text-blue-600" />
            <p className="text-sm font-bold text-blue-900">{confirmationProb}% Confirmation</p>
          </div>
        </div>

        {/* Progress Bar */}
        {step < 4 && (
          <div className="flex items-center justify-center gap-4 py-4">
            {[1, 2, 3].map((s) => (
              <React.Fragment key={s}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${step === s ? 'bg-blue-600 text-white shadow-lg ring-4 ring-blue-50' : step > s ? 'bg-green-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                  {step > s ? <Check size={18} /> : s}
                </div>
                {s < 3 && <div className={`h-1 w-12 rounded ${step > s ? 'bg-green-500' : 'bg-slate-200'}`}></div>}
              </React.Fragment>
            ))}
          </div>
        )}

        {/* Step 1: Seat Selection */}
        {step === 1 && (
          <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-black text-slate-900">Choose Your Berths</h2>
              <p className="text-slate-500 text-sm">Select one or more sleepers for your group.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Lower Deck */}
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest text-center border-b pb-4">Lower Deck</h3>
                <div className="grid grid-cols-3 gap-4">
                  {seats.filter(s => s.type === BerthType.LOWER).map(seat => (
                    <button
                      key={seat.id}
                      disabled={seat.status === SeatStatus.OCCUPIED}
                      onClick={() => toggleSeat(seat)}
                      className={`h-16 rounded-xl border-2 flex flex-col items-center justify-center gap-1 transition-all ${
                        selectedSeats.some(s => s.id === seat.id) ? 'bg-blue-600 border-blue-600 text-white shadow-lg scale-105' : 
                        seat.status === SeatStatus.OCCUPIED ? 'bg-slate-100 border-slate-100 text-slate-300 cursor-not-allowed' : 
                        'bg-white border-slate-100 hover:border-blue-300 hover:bg-blue-50 text-slate-700'
                      }`}
                    >
                      <Bed size={14} className="opacity-40" />
                      <span className="text-xs font-black">{seat.number}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Upper Deck */}
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest text-center border-b pb-4">Upper Deck</h3>
                <div className="grid grid-cols-3 gap-4">
                  {seats.filter(s => s.type === BerthType.UPPER).map(seat => (
                    <button
                      key={seat.id}
                      disabled={seat.status === SeatStatus.OCCUPIED}
                      onClick={() => toggleSeat(seat)}
                      className={`h-16 rounded-xl border-2 flex flex-col items-center justify-center gap-1 transition-all ${
                        selectedSeats.some(s => s.id === seat.id) ? 'bg-blue-600 border-blue-600 text-white shadow-lg scale-105' : 
                        seat.status === SeatStatus.OCCUPIED ? 'bg-slate-100 border-slate-100 text-slate-300 cursor-not-allowed' : 
                        'bg-white border-slate-100 hover:border-blue-300 hover:bg-blue-50 text-slate-700'
                      }`}
                    >
                      <Bed size={14} className="opacity-40" />
                      <span className="text-xs font-black">{seat.number}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 bg-slate-900 rounded-[2rem] text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Selection Overview</p>
                <p className="text-xl font-black">{selectedSeats.length > 0 ? `${selectedSeats.length} Seats: ${selectedSeats.map(s => s.number).join(', ')}` : 'No berths selected'}</p>
              </div>
              <button 
                disabled={selectedSeats.length === 0}
                onClick={() => setStep(2)}
                className="px-10 py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 disabled:opacity-50 transition-all shadow-lg shadow-blue-500/20 active:scale-95 flex items-center gap-2"
              >
                Assign Meals <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Individual Meal Assignment */}
        {step === 2 && (
          <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-black text-slate-900">Personalize Your Meals</h2>
              <p className="text-slate-500 text-sm">Select exactly one food item for each passenger's berth.</p>
            </div>

            <div className="space-y-6">
              {selectedSeats.map((seat, index) => (
                <div key={seat.id} className={`p-8 rounded-[2.5rem] border-2 transition-all ${seatMeals[seat.id] ? 'bg-green-50/30 border-green-200' : 'bg-white border-slate-100'}`}>
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${seatMeals[seat.id] ? 'bg-green-500 text-white' : 'bg-blue-600 text-white'}`}>
                        <Bed size={24} />
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-slate-900">Berth {seat.number}</h3>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{seat.type} SLEEPER</p>
                      </div>
                    </div>
                    {seatMeals[seat.id] ? (
                      <div className="flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest">
                        <CheckCircle size={16} /> Meal Assigned
                      </div>
                    ) : (
                      <div className="text-amber-500 text-xs font-black uppercase tracking-widest animate-pulse">
                        Pending Selection
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {meals.map(meal => (
                      <button
                        key={meal.id}
                        onClick={() => assignMealToSeat(seat.id, meal)}
                        className={`relative p-3 rounded-2xl border-2 transition-all text-left flex flex-col gap-2 group ${
                          seatMeals[seat.id]?.id === meal.id ? 'border-blue-600 bg-blue-50/50 ring-4 ring-blue-50' : 'border-slate-50 bg-slate-50/30 hover:border-blue-200'
                        }`}
                      >
                        <div className="h-24 rounded-xl overflow-hidden mb-2">
                          <img src={meal.image} alt={meal.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between items-center">
                            <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase ${
                              meal.category === 'Veg' ? 'bg-green-100 text-green-700' : 
                              meal.category === 'Jain' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {meal.category}
                            </span>
                            <p className="text-xs font-black text-slate-900">₹{meal.price}</p>
                          </div>
                          <p className="text-xs font-bold text-slate-800 line-clamp-1">{meal.name}</p>
                        </div>
                        {seatMeals[seat.id]?.id === meal.id && (
                          <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg">
                            <Check size={14} strokeWidth={4} />
                          </div>
                        )}
                      </button>
                    ))}

                    <button
                      onClick={() => {
                          assignMealToSeat(seat.id, { id: 'none', name: 'No Meal', price: 0, description: '', image: '', category: 'Veg' });
                      }}
                      className={`p-6 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center text-center gap-2 transition-all ${
                        seatMeals[seat.id]?.id === 'none' ? 'border-blue-600 bg-blue-50' : 'border-slate-100 hover:border-blue-200'
                      }`}
                    >
                      <X className={seatMeals[seat.id]?.id === 'none' ? 'text-blue-600' : 'text-slate-300'} />
                      <p className="text-xs font-black text-slate-500 uppercase tracking-widest">No Meal</p>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center pt-8 border-t">
              <button onClick={() => setStep(1)} className="flex items-center gap-2 text-slate-400 font-bold hover:text-slate-900 transition-colors">
                <ArrowLeft size={18} /> Edit Berths
              </button>
              <button 
                disabled={Object.keys(seatMeals).length < selectedSeats.length}
                onClick={() => setStep(3)}
                className="px-10 py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 disabled:opacity-50 transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2"
              >
                Review Booking <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Review */}
        {step === 3 && (
          <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
            <h2 className="text-2xl font-black text-slate-900 text-center">Confirm & Proceed</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2 space-y-6">
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Lead Passenger Name</label>
                    <input 
                      type="text" 
                      value={passengerName}
                      onChange={(e) => setPassengerName(e.target.value)}
                      placeholder="Enter full name"
                      className="w-full h-14 px-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold"
                    />
                  </div>

                  <div className="space-y-4 pt-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Detailed Breakdown</p>
                    {selectedSeats.map(seat => (
                      <div key={seat.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center font-black text-blue-600 border border-slate-100">{seat.number}</div>
                          <div>
                            <p className="text-sm font-bold text-slate-800">{seat.type} BERTH</p>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{seatMeals[seat.id]?.id === 'none' ? 'No Meal Selected' : seatMeals[seat.id]?.name}</p>
                          </div>
                        </div>
                        <p className="font-black text-slate-900">₹{seat.price + (seatMeals[seat.id]?.price || 0)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-2xl space-y-6">
                  <h3 className="font-black text-sm uppercase tracking-widest text-slate-500">Fare Summary</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400 font-bold">Base Fare ({selectedSeats.length}x)</span>
                      <span className="font-bold">₹{totalSeatsPrice}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400 font-bold">Meal Add-ons</span>
                      <span className="font-bold">₹{totalMealsPrice}</span>
                    </div>
                    <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                      <p className="text-xs font-black text-blue-400 uppercase">Grand Total</p>
                      <p className="text-3xl font-black">₹{totalAmount}</p>
                    </div>
                  </div>
                  <button 
                    disabled={loading || !passengerName.trim()}
                    onClick={handleBooking}
                    className="w-full py-5 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-95 disabled:opacity-50"
                  >
                    {loading ? <RefreshCw className="animate-spin mx-auto" /> : 'Confirm Booking'}
                  </button>
                </div>
              </div>
            </div>
            
            <button onClick={() => setStep(2)} className="flex items-center gap-2 text-slate-400 font-bold hover:text-slate-900 transition-colors">
              <ArrowLeft size={18} /> Back to Meals
            </button>
          </div>
        )}

        {/* Step 4: Success */}
        {step === 4 && bookedInfo && (
          <div className="bg-white p-12 rounded-[3rem] border border-slate-100 text-center space-y-8 shadow-2xl animate-in zoom-in duration-500">
            <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto ring-[12px] ring-green-50 shadow-inner">
              <CheckCircle size={48} strokeWidth={2.5} />
            </div>
            <div className="space-y-2">
              <h2 className="text-4xl font-black text-slate-900">Success!</h2>
              <p className="text-slate-500 font-medium">Your tickets for {bookedInfo.passengerName} are confirmed.</p>
              <div className="mt-4 px-4 py-1 bg-slate-900 text-blue-400 text-xs font-black rounded-lg inline-block uppercase tracking-widest">Ticket ID: {bookedInfo.id}</div>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
              <button onClick={() => navigate('/dashboard')} className="w-full sm:w-auto px-10 py-4 bg-slate-900 text-white font-black rounded-2xl flex items-center justify-center gap-2 shadow-lg"><LayoutDashboard size={18} /> Go to Dashboard</button>
              <button onClick={handlePrint} className="w-full sm:w-auto px-10 py-4 bg-white text-slate-600 border border-slate-200 font-bold rounded-2xl flex items-center justify-center gap-2">
                <Printer size={18} /> Print Ticket
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Hidden Printable Ticket Template */}
      {bookedInfo && (
        <div id="printable-ticket" className="hidden">
          <div className="max-w-2xl mx-auto border-4 border-slate-900 p-10 bg-white">
            <div className="flex justify-between items-start border-b-4 border-slate-900 pb-8 mb-8">
              <div className="space-y-2">
                <h1 className="text-4xl font-black uppercase tracking-tighter">SleeperSwift</h1>
                <p className="text-sm font-bold text-slate-500">Official E-Ticket & Boarding Pass</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black uppercase text-slate-400">Booking Reference</p>
                <p className="text-2xl font-black">{bookedInfo.id}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 mb-10">
              <div>
                <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Passenger Name</p>
                <p className="text-xl font-bold">{bookedInfo.passengerName}</p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Travel Date</p>
                <p className="text-xl font-bold">{new Date(bookingDate).toLocaleDateString(undefined, { dateStyle: 'full' })}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 mb-10 bg-slate-50 p-6 rounded-2xl border border-slate-200">
              <div className="flex-1">
                <p className="text-[10px] font-black uppercase text-slate-400">Origin</p>
                <p className="text-lg font-black">{fromStation?.name}</p>
                <p className="text-xs text-slate-500">Boarding at 21:00 hrs</p>
              </div>
              <div className="h-px w-12 bg-slate-400" />
              <div className="flex-1 text-right">
                <p className="text-[10px] font-black uppercase text-slate-400">Destination</p>
                <p className="text-lg font-black">{toStation?.name}</p>
                <p className="text-xs text-slate-500">Approx. Arrival T+11h</p>
              </div>
            </div>

            <div className="space-y-4 mb-10">
              <p className="text-[10px] font-black uppercase text-slate-400">Berth & Service Summary</p>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b-2 border-slate-200">
                    <th className="py-2 text-xs font-black">Berth No.</th>
                    <th className="py-2 text-xs font-black">Type</th>
                    <th className="py-2 text-xs font-black">Pre-booked Meal</th>
                    <th className="py-2 text-xs font-black text-right">Service Stop</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedSeats.map(seat => (
                    <tr key={seat.id} className="border-b border-slate-100">
                      <td className="py-3 text-sm font-bold">{seat.number}</td>
                      <td className="py-3 text-xs">{seat.type}</td>
                      <td className="py-3 text-xs">{seatMeals[seat.id]?.id === 'none' ? 'NO MEAL' : seatMeals[seat.id]?.name}</td>
                      <td className="py-3 text-xs text-right">Vadodara Halt</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-end border-t-4 border-slate-900 pt-8">
              <div className="flex items-center gap-4">
                <QrCode size={80} className="text-slate-900" />
                <div className="text-[10px] font-bold text-slate-400 max-w-[150px]">
                  Scan this code at Ahmedabad (Gita Mandir) platform gate 4 for priority boarding.
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black uppercase text-slate-400">Total Fare Paid</p>
                <p className="text-4xl font-black">₹{bookedInfo.totalAmount}</p>
              </div>
            </div>

            <div className="mt-8 text-center">
              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.2em]">Thank you for choosing SleeperSwift Premium Services</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingPage;
