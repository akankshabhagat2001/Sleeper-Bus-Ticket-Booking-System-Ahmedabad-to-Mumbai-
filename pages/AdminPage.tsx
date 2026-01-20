
import React, { useState, useEffect, useMemo } from 'react';
import { busService } from '../services/busService';
import { Booking, Seat, SeatStatus } from '../types';
import { STATIONS } from '../constants';
import { 
  Users, TrendingUp, Percent, IndianRupee, 
  Settings, Trash2, RefreshCw, AlertTriangle, 
  Search, ShieldAlert, Bed, Filter, CheckCircle, X
} from 'lucide-react';

const AdminPage: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'Bookings' | 'Inventory'>('Bookings');
  const [alert, setAlert] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = async () => {
    setLoading(true);
    const [history, busSeats] = await Promise.all([
      busService.getBookingHistory(),
      busService.getSeats()
    ]);
    setBookings([...history].reverse());
    setSeats(busSeats);
    setLoading(false);
  };

  const stats = useMemo(() => {
    const active = bookings.filter(b => b.status === 'Confirmed');
    const revenue = active.reduce((acc, b) => acc + b.totalAmount, 0);
    const occupancy = (seats.filter(s => s.status === SeatStatus.OCCUPIED).length / seats.length) * 100;

    return {
      revenue,
      occupancy: occupancy.toFixed(1),
      totalBookings: bookings.length,
      activeTickets: active.length
    };
  }, [bookings, seats]);

  const filteredBookings = useMemo(() => {
    return bookings.filter(b => 
      b.passengerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.id.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [bookings, searchQuery]);

  const toggleSeatStatus = async (seatId: string, currentStatus: SeatStatus) => {
    const nextStatus = currentStatus === SeatStatus.AVAILABLE ? SeatStatus.OCCUPIED : SeatStatus.AVAILABLE;
    if (window.confirm(`Manually set Seat ${seatId} to ${nextStatus}?`)) {
      await busService.updateSeatStatus(seatId, nextStatus);
      refreshData();
      setAlert({
        message: `Override Successful: Seat ${seatId} is now ${nextStatus}. Changes are active immediately across the system.`,
        type: 'success'
      });
      // Auto-dismiss after 5 seconds
      setTimeout(() => setAlert(null), 5000);
    }
  };

  const resetSystem = async () => {
    if (window.confirm("CRITICAL: This will delete ALL bookings and reset seat inventory. Continue?")) {
      await busService.resetSystem();
      refreshData();
      setAlert({
        message: "System Reset Complete: All data has been purged and inventory returned to factory defaults.",
        type: 'info'
      });
      setTimeout(() => setAlert(null), 5000);
    }
  };

  const getStationName = (id: string) => STATIONS.find(s => s.id === id)?.name || id;

  if (loading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center gap-4">
        <RefreshCw className="animate-spin text-blue-600" size={32} />
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Loading Admin Data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Dynamic Alert Banner */}
      {alert && (
        <div className={`p-4 rounded-2xl flex items-center justify-between shadow-lg shadow-black/5 animate-in slide-in-from-top-4 duration-300 ${
          alert.type === 'success' ? 'bg-green-600 text-white' : 'bg-blue-600 text-white'
        }`}>
          <div className="flex items-center gap-3">
            <CheckCircle size={20} />
            <p className="text-sm font-bold">{alert.message}</p>
          </div>
          <button 
            onClick={() => setAlert(null)}
            className="p-1 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>
      )}

      {/* Admin Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
            <ShieldAlert className="text-blue-600" /> Admin Command Center
          </h1>
          <p className="text-slate-500 font-medium">SleeperSwift Master Oversight & Inventory Management</p>
        </div>
        <div className="flex gap-2">
          <button onClick={refreshData} className="p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
            <RefreshCw size={20} className="text-slate-600" />
          </button>
          <button onClick={resetSystem} className="p-3 bg-red-50 border border-red-100 rounded-xl hover:bg-red-100 transition-colors group">
            <Settings size={20} className="text-red-600 group-hover:rotate-90 transition-transform" />
          </button>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue', value: `₹${stats.revenue}`, icon: <IndianRupee />, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Occupancy Rate', value: `${stats.occupancy}%`, icon: <Percent />, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Total Tickets', value: stats.totalBookings, icon: <Users />, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Active Trips', value: stats.activeTickets, icon: <TrendingUp />, color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map((item, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className={`w-10 h-10 ${item.bg} ${item.color} rounded-xl flex items-center justify-center mb-4`}>
              {item.icon}
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.label}</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{item.value}</p>
          </div>
        ))}
      </div>

      {/* Tab Controls */}
      <div className="flex border-b border-slate-200">
        {(['Bookings', 'Inventory'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-8 py-4 font-bold text-sm transition-all border-b-2 ${
              activeTab === tab ? 'border-blue-600 text-blue-600 bg-blue-50/30' : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content Area */}
      {activeTab === 'Bookings' ? (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search by ID or Passenger Name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
              <Filter size={16} /> Filtered: {filteredBookings.length}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Passenger</th>
                  <th className="px-6 py-4">Seat</th>
                  <th className="px-6 py-4">Route</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredBookings.map(b => (
                  <tr key={b.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs font-bold">{b.id}</td>
                    <td className="px-6 py-4 font-bold text-slate-800">{b.passengerName}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded-md text-xs font-bold">{b.seatId}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs">
                        <span className="font-bold">{getStationName(b.fromStationId)}</span>
                        <span className="mx-2 text-slate-300">→</span>
                        <span className="font-bold">{getStationName(b.toStationId)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold">₹{b.totalAmount}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                        b.status === 'Confirmed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {b.status === 'Confirmed' && (
                        <button 
                          onClick={() => busService.cancelBooking(b.id).then(refreshData)}
                          className="text-red-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl flex items-start gap-3">
              <AlertTriangle className="text-amber-600 shrink-0" size={20} />
              <div>
                <p className="text-sm font-bold text-amber-900">Manual Inventory Override</p>
                <p className="text-xs text-amber-700">Click a seat to manually toggle its status. This bypasses the booking system for maintenance purposes.</p>
              </div>
            </div>
            
            <div className="grid grid-cols-5 gap-3 bg-white p-6 rounded-3xl border border-slate-100">
              {seats.map(seat => (
                <button
                  key={seat.id}
                  onClick={() => toggleSeatStatus(seat.id, seat.status)}
                  className={`h-12 flex flex-col items-center justify-center rounded-xl border transition-all ${
                    seat.status === SeatStatus.OCCUPIED 
                      ? 'bg-slate-800 border-slate-800 text-white' 
                      : 'bg-white border-slate-200 text-slate-400 hover:border-blue-400'
                  }`}
                >
                  <Bed size={12} className="mb-0.5" />
                  <span className="text-[10px] font-black">{seat.number}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-100 space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-2"><Settings size={20} /> System Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                <div>
                  <p className="font-bold text-sm">Emergency System Lockdown</p>
                  <p className="text-xs text-slate-500">Prevent any new bookings immediately.</p>
                </div>
                <div className="w-12 h-6 bg-slate-200 rounded-full relative">
                  <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                <div>
                  <p className="font-bold text-sm">Dynamic Pricing Engine</p>
                  <p className="text-xs text-slate-500">Enable AI-driven fare adjustments based on demand.</p>
                </div>
                <div className="w-12 h-6 bg-blue-600 rounded-full relative">
                  <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100">
              <button 
                onClick={resetSystem}
                className="w-full py-4 bg-red-50 text-red-600 font-black rounded-2xl border border-red-100 hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-2"
              >
                <Trash2 size={20} /> Factory Reset Database
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
