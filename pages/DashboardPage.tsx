
import React, { useState, useEffect } from 'react';
import { busService } from '../services/busService';
import { Booking } from '../types';
import { STATIONS, MEALS } from '../constants';
import { Calendar, MapPin, User, Utensils, IndianRupee, Trash2, CheckCircle, XCircle, Database, RefreshCw } from 'lucide-react';

const DashboardPage: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [dbStatus, setDbStatus] = useState<'Syncing' | 'Connected'>('Syncing');

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    setLoading(true);
    setDbStatus('Syncing');
    const history = await busService.getBookingHistory();
    setBookings([...history].reverse());
    setTimeout(() => {
        setLoading(false);
        setDbStatus('Connected');
    }, 400);
  };

  const handleCancel = async (id: string) => {
    if (window.confirm("Are you sure you want to cancel this booking?")) {
      const success = await busService.cancelBooking(id);
      if (success) {
        loadBookings();
      }
    }
  };

  const getStationName = (id: string) => STATIONS.find(s => s.id === id)?.name || id;
  const getMealName = (id?: string) => MEALS.find(m => m.id === id)?.name || 'No meal';

  if (loading && bookings.length === 0) {
    return <div className="h-96 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="text-slate-500 font-medium">Connecting to Database...</p>
      </div>
    </div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">My Bookings</h1>
          <p className="text-slate-500">Manage your upcoming journeys and check ticket status.</p>
        </div>
        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm">
            <div className={`w-2 h-2 rounded-full ${dbStatus === 'Connected' ? 'bg-green-500 animate-pulse' : 'bg-amber-500'}`} />
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <Database size={14} /> 
                Store: {dbStatus === 'Connected' ? 'Local Persistence' : 'Connecting...'}
            </div>
            <button onClick={loadBookings} className="ml-2 text-slate-400 hover:text-blue-600 transition-colors">
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>
        </div>
      </div>

      {bookings.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-dashed border-slate-200 text-center space-y-4">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
            <Calendar size={32} />
          </div>
          <p className="text-slate-500 font-medium">You haven't made any bookings yet.</p>
          <a href="/#/" className="inline-block text-blue-600 font-bold hover:underline">Start booking now</a>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {bookings.map((booking) => (
            <div key={booking.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow group">
              <div className="p-6 md:p-8">
                <div className="flex flex-col md:flex-row justify-between gap-6">
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Ticket #{booking.id}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        booking.status === 'Confirmed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {booking.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-8">
                      <div className="text-center md:text-left">
                        <p className="text-lg font-bold">{getStationName(booking.fromStationId)}</p>
                      </div>
                      <div className="h-px flex-1 bg-slate-100 relative hidden md:block">
                        <div className="absolute -top-1 right-0 w-2 h-2 rounded-full bg-slate-300"></div>
                      </div>
                      <div className="text-center md:text-right">
                        <p className="text-lg font-bold">{getStationName(booking.toStationId)}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center gap-2 text-slate-600">
                        <User size={16} className="text-slate-400" />
                        <span className="truncate">{booking.passengerName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <CheckCircle size={16} className="text-slate-400" />
                        <span>Seat {booking.seatId}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <Utensils size={16} className="text-slate-400" />
                        <span className="truncate">{getMealName(booking.mealId)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-900 font-bold">
                        <IndianRupee size={16} className="text-slate-400" />
                        <span>{booking.totalAmount}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end border-t md:border-t-0 md:border-l border-slate-50 pt-4 md:pt-0 md:pl-8">
                    {booking.status === 'Confirmed' && (
                      <button 
                        onClick={() => handleCancel(booking.id)}
                        className="flex items-center gap-2 px-4 py-2 text-red-600 font-bold hover:bg-red-50 rounded-xl transition-colors"
                      >
                        <Trash2 size={18} /> Cancel
                      </button>
                    )}
                    {booking.status === 'Cancelled' && (
                      <div className="flex items-center gap-2 text-slate-400 font-bold px-4 py-2">
                        <XCircle size={18} /> Cancelled
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
