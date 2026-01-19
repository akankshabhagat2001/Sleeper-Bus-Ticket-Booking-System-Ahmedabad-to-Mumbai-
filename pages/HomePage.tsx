
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Calendar, ArrowRightLeft } from 'lucide-react';
import { STATIONS } from '../constants';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [from, setFrom] = useState(STATIONS[0].id);
  const [to, setTo] = useState(STATIONS[STATIONS.length - 1].id);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSearch = () => {
    navigate(`/book/${from}/${to}?date=${date}`);
  };

  const handleSwap = () => {
    const temp = from;
    setFrom(to);
    setTo(temp);
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <section className="text-center space-y-4">
        <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tight">
          Reliable Journeys <br />
          <span className="text-blue-600">Ahmedabad to Mumbai</span>
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Experience the comfort of premium sleeper coaches with integrated meal booking and real-time confirmation probability.
        </p>
      </section>

      <div className="bg-white rounded-3xl shadow-xl shadow-blue-500/5 p-6 md:p-10 border border-slate-100 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-2 h-full bg-blue-600"></div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-500 flex items-center gap-2">
              <MapPin size={16} /> FROM
            </label>
            <select 
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="w-full h-14 bg-slate-50 border border-slate-200 rounded-xl px-4 focus:ring-2 focus:ring-blue-500 transition-all outline-none"
            >
              {STATIONS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>

          <div className="flex justify-center md:pb-3">
            <button 
              onClick={handleSwap}
              className="p-3 bg-white border border-slate-200 rounded-full hover:bg-slate-50 transition-colors shadow-sm"
            >
              <ArrowRightLeft className="text-blue-600" />
            </button>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-500 flex items-center gap-2">
              <MapPin size={16} /> TO
            </label>
            <select 
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="w-full h-14 bg-slate-50 border border-slate-200 rounded-xl px-4 focus:ring-2 focus:ring-blue-500 transition-all outline-none"
            >
              {STATIONS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-500 flex items-center gap-2">
              <Calendar size={16} /> DATE
            </label>
            <input 
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full h-14 bg-slate-50 border border-slate-200 rounded-xl px-4 focus:ring-2 focus:ring-blue-500 transition-all outline-none"
            />
          </div>
        </div>

        <button 
          onClick={handleSearch}
          className="w-full mt-10 h-16 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl flex items-center justify-center gap-3 text-lg transition-transform hover:scale-[1.01] active:scale-[0.99] shadow-lg shadow-blue-500/30"
        >
          <Search size={22} />
          Search Bus
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { title: "Premium Sleeper", desc: "Ergonomic berths for ultimate comfort", icon: "🚌" },
          { title: "Gourmet Meals", desc: "Pre-book your favorite Gujarati or Indian meals", icon: "🍱" },
          { title: "AI Predictions", desc: "Know the probability of your ticket confirmation", icon: "🤖" },
        ].map((feat, i) => (
          <div key={i} className="bg-white p-8 rounded-2xl border border-slate-100 hover:shadow-md transition-shadow">
            <div className="text-3xl mb-4">{feat.icon}</div>
            <h3 className="font-bold text-xl mb-2">{feat.title}</h3>
            <p className="text-slate-500">{feat.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomePage;
