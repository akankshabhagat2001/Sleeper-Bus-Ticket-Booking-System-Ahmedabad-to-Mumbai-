
import React, { useState, useEffect, useMemo } from 'react';
import { busService } from '../services/busService';
import { Booking } from '../types';
import { STATIONS, MEALS } from '../constants';
import { Calendar, MapPin, User, Utensils, IndianRupee, Trash2, CheckCircle, XCircle, Database, RefreshCw, BarChart3, CloudDownload, Bed } from 'lucide-react';

const DashboardPage: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [dbStatus, setDbStatus] = useState<'Syncing' | 'Connected'>('Syncing');

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    setLoading(true);
    setDbStatus('Syncing');
    const history = await busService.getBookingHistory();
    setBookings([...history].sort((a, b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime()));
    setTimeout(() => {
        setLoading(false);
        setDbStatus('Connected');
    }, 400);
  };

  const handleSync = async () => {
    setIsSyncing(true);
    await busService.syncData();
    await loadBookings();
    setIsSyncing(false);
  };

  const handleCancel = async (id: string) => {
    if (window.confirm("Are you sure you want to cancel this booking? This action will release all seats in this group.")) {
      setCancellingId(id);
      try {
        const success = await busService.cancelBooking(id);
        if (success) {
          await loadBookings();
        }
      } catch (err) {
        alert("Could not cancel booking. Please try again.");
      } finally {
        setCancellingId(null);
      }
    }
  };

  const stats = useMemo(() => {
    const confirmed = bookings.filter(b => b.status === 'Confirmed');
    const spent = confirmed.reduce((acc, b) => acc + b.totalAmount, 0);
    return {
      count: confirmed.length,
      totalSpent: spent,
      cancelled: bookings.filter(b => b.status === 'Cancelled').length
    };
  }, [bookings]);

  const getStationName = (id: string) => STATIONS.find(s => s.id === id)?.name || id;
  const getMealName = (id?: string) => MEALS.find(m => m.id === id)?.name || 'No meal';

  if (loading && bookings.length === 0) {
    return (
      <div className="h-96 flex flex-col items-center justify-center gap-4">
        <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-100 border-t-blue-600"></div>
            <Database className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-600" size={20} />
        </div>
        <p className="text-slate-500 font-bold animate-pulse uppercase tracking-widest text-xs">Authenticating with Store...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">My Travel Hub</h1>
          <p className="text-slate-500 font-medium">Manage your tickets and track journey history.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
            <button 
                onClick={handleSync}
                disabled={isSyncing}
                className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 text-xs font-bold rounded-xl border border-blue-100 hover:bg-blue-100 transition-all disabled:opacity-50"
            >
                <CloudDownload size={14} className={isSyncing ? 'animate-bounce' : ''} />
                {isSyncing ? 'Syncing with API...' : 'Fetch Remote Data'}
            </button>
            <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm">
                <div className={`w-2 h-2 rounded-full ${dbStatus === 'Connected' ? 'bg-green-500 animate-pulse' : 'bg-amber-500'}`} />
                <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <Database size={12} /> {dbStatus}
                </div>
                <button onClick={loadBookings} className="ml-2 text-slate-300 hover:text-blue-600 transition-colors">
                    <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                </button>
            </div>
        </div>
      </div>

      {bookings.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
              <BarChart3 size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Upcoming Trips</p>
              <p className="text-xl font-black text-slate-900">{stats.count}</p>
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
              <IndianRupee size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Total Investment</p>
              <p className="text-xl font-black text-slate-900">₹{stats.totalSpent}</p>
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-red-50 text-red-600 rounded-xl flex items-center justify-center">
              <XCircle size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Cancellations</p>
              <p className="text-xl font-black text-slate-900">{stats.cancelled}</p>
            </div>
          </div>
        </div>
      )}

      {bookings.length === 0 ? (
        <div className="bg-white p-16 rounded-[2.5rem] border-2 border-dashed border-slate-100 text-center space-y-6">
          <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200">
            <Calendar size={48} />
          </div>
          <div className="space-y-2">
            <p className="text-xl font-bold text-slate-800">No journeys scheduled</p>
            <p className="text-slate-400 max-w-xs mx-auto text-sm">Your travel history is empty. Book a premium sleeper berth to get started.</p>
          </div>
          <a href="/#/" className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20">
            Plan New Journey
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div key={booking.id} className={`bg-white rounded-[2rem] border transition-all duration-300 ${
                booking.status === 'Cancelled' ? 'opacity-75 grayscale-[0.5] border-slate-100' : 'border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1'
            }`}>
              <div className="p-6 md:p-8">
                <div className="flex flex-col lg:flex-row justify-between gap-8">
                  <div className="flex-1 space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="px-3 py-1 bg-slate-900 text-white text-[10px] font-black rounded-lg tracking-widest uppercase">
                                Ticket #{booking.id}
                            </div>
                            <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                                booking.status === 'Confirmed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                                {booking.status}
                            </span>
                        </div>
                        <p className="text-[10px] font-bold text-slate-400">{new Date(booking.bookingDate).toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
                    </div>

                    <div className="flex items-center gap-4 md:gap-10">
                      <div className="flex-shrink-0 text-slate-400">
                          <MapPin size={24} />
                      </div>
                      <div className="flex-1 flex flex-col md:flex-row md:items-center gap-2 md:gap-8">
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Origin</p>
                          <p className="text-xl font-black text-slate-900">{getStationName(booking.fromStationId)}</p>
                        </div>
                        <div className="hidden md:flex flex-1 items-center gap-2">
                           <div className="h-px flex-1 bg-slate-200"></div>
                        </div>
                        <div className="md:text-right">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Destination</p>
                          <p className="text-xl font-black text-slate-900">{getStationName(booking.toStationId)}</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <p className="text-[10px] font-black text-slate-400 uppercase mb-3 flex items-center gap-1"><Bed size={10} /> Occupied Seats & Meals</p>
                            <div className="space-y-2">
                                {booking.seatIds.map(sid => {
                                    const mealId = booking.seatMeals.find(sm => sm.seatId === sid)?.mealId;
                                    return (
                                        <div key={sid} className="flex justify-between items-center bg-white p-2 rounded-xl border border-slate-50 shadow-sm">
                                            <span className="text-xs font-bold text-slate-700">Seat {sid}</span>
                                            <span className="text-[10px] text-slate-400 italic">{getMealName(mealId)}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <p className="text-[9px] font-black text-slate-400 uppercase flex items-center gap-1"><User size={10} /> Passenger</p>
                                <p className="text-xs font-bold text-slate-700 truncate">{booking.passengerName}</p>
                            </div>
                            <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                                <p className="text-[9px] font-black text-blue-400 uppercase flex items-center gap-1"><IndianRupee size={10} /> Total Paid</p>
                                <p className="text-lg font-black text-blue-600">₹{booking.totalAmount}</p>
                            </div>
                        </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-center lg:w-48 lg:border-l border-slate-50 lg:pl-8">
                    {booking.status === 'Confirmed' ? (
                      <button 
                        onClick={() => handleCancel(booking.id)}
                        disabled={cancellingId === booking.id}
                        className={`group w-full flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-bold transition-all ${
                            cancellingId === booking.id 
                            ? 'bg-slate-100 text-slate-400 cursor-wait' 
                            : 'bg-red-50 text-red-600 hover:bg-red-600 hover:text-white shadow-sm'
                        }`}
                      >
                        {cancellingId === booking.id ? (
                          <>
                            <RefreshCw size={18} className="animate-spin" />
                            <span className="text-xs">Processing...</span>
                          </>
                        ) : (
                          <>
                            <Trash2 size={18} className="group-hover:scale-110 transition-transform" />
                            <span>Cancel Trip</span>
                          </>
                        )}
                      </button>
                    ) : (
                      <div className="w-full flex flex-col items-center gap-2 py-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <XCircle size={24} className="text-slate-300" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Released</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
