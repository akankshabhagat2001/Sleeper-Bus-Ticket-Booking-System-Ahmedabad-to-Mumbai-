
import React from 'react';
import { ClipboardList, ShieldCheck, BrainCircuit, Terminal, List, Bug, CheckCircle, Smartphone, Database, Zap } from 'lucide-react';
import { PREDICTION_DOCS } from '../services/mlService';

const DocsPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20 animate-in fade-in duration-500">
      <section className="space-y-4">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">System Documentation</h1>
        <p className="text-lg text-slate-500">SleeperSwift Technical Specification & QA Framework.</p>
      </section>

      {/* 1. Core Features */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg text-white"><List size={20}/></div>
          <h2 className="text-2xl font-bold">1. Core Features</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { title: "Multi-Deck Seat Visualizer", desc: "Interactive mapping of Upper and Lower berths with real-time availability states.", icon: <Zap size={16}/> },
            { title: "Integrated Meal Marketplace", desc: "Category-based meal selection (Veg/Non-Veg/Jain) embedded in the checkout flow.", icon: <Zap size={16}/> },
            { title: "AI Booking Predictor", desc: "ML-driven confirmation probability engine based on lead time and occupancy.", icon: <Zap size={16}/> },
            { title: "Intermediate Station Routing", desc: "Dynamic fare calculation and time-offset tracking for stops like Surat and Vadodara.", icon: <Zap size={16}/> },
            { title: "Admin Fleet Controller", desc: "Master dashboard for inventory overrides, revenue tracking, and system resets.", icon: <Zap size={16}/> },
            { title: "Secure Admin Portal", desc: "Credential-guarded access to sensitive operational data and fleet management.", icon: <Zap size={16}/> },
            { title: "Smart Travel Dashboard", desc: "End-user portal for ticket management, one-click cancellations, and sync history.", icon: <Zap size={16}/> }
          ].map((f, i) => (
            <div key={i} className="p-5 bg-white rounded-2xl border border-slate-100 space-y-2 group hover:border-blue-200 transition-colors">
              <div className="flex items-center gap-2 text-blue-600 font-bold text-sm">
                {f.icon} {f.title}
              </div>
              <p className="text-sm text-slate-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 2. Test Cases */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="bg-green-600 p-2 rounded-lg text-white"><ShieldCheck size={20}/></div>
          <h2 className="text-2xl font-bold">2. Test Cases</h2>
        </div>
        <div className="grid grid-cols-1 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100">
            <h3 className="font-black mb-4 text-slate-400 uppercase text-[10px] tracking-[0.2em]">Functional & ML Testing</h3>
            <ul className="space-y-4">
              <li className="flex gap-4">
                <div className="mt-1 shrink-0 w-5 h-5 bg-green-100 text-green-600 rounded-full flex items-center justify-center"><CheckCircle size={12}/></div>
                <div>
                    <p className="text-sm font-bold text-slate-800">Seat Occupancy Persistence</p>
                    <p className="text-xs text-slate-500">Verify that booking Seat L5 removes it from the 'Available' pool for all subsequent sessions immediately.</p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="mt-1 shrink-0 w-5 h-5 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center"><BrainCircuit size={12}/></div>
                <div>
                    <p className="text-sm font-bold text-slate-800">ML Prediction Sensitivity</p>
                    <p className="text-xs text-slate-500">Ensure the confirmation percentage increases when the travel date is moved closer to 'Today' (Testing Lead Time weight).</p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="mt-1 shrink-0 w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center"><Database size={12}/></div>
                <div>
                    <p className="text-sm font-bold text-slate-800">Meal-Ticket Aggregation</p>
                    <p className="text-xs text-slate-500">Confirm the 'Total Amount' in the checkout summary correctly sums the base fare (₹1200) and the selected meal (e.g., ₹250).</p>
                </div>
              </li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100">
            <h3 className="font-black mb-4 text-slate-400 uppercase text-[10px] tracking-[0.2em]">Edge & Security Case Testing</h3>
            <ul className="space-y-4">
              <li className="flex gap-4">
                <div className="mt-1 shrink-0 w-5 h-5 bg-red-100 text-red-600 rounded-full flex items-center justify-center"><Bug size={12}/></div>
                <div>
                    <p className="text-sm font-bold text-slate-800">Unauthorized Admin Access</p>
                    <p className="text-xs text-slate-500">Attempt to navigate to /admin without a session. System must redirect to /login and block component rendering.</p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="mt-1 shrink-0 w-5 h-5 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center"><Smartphone size={12}/></div>
                <div>
                    <p className="text-sm font-bold text-slate-800">Mobile Layout Breakpoints</p>
                    <p className="text-xs text-slate-500">Validate that the seat selection grid switches to a single column or scrollable view on devices below 375px width.</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 3. Prediction Methodology */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="bg-slate-900 p-2 rounded-lg text-white"><Terminal size={20}/></div>
          <h2 className="text-2xl font-bold">3. Prediction Approach</h2>
        </div>
        <div className="bg-slate-900 text-slate-300 p-8 rounded-[2.5rem] space-y-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <BrainCircuit size={120} />
          </div>
          
          <div className="space-y-3 relative z-10">
            <h3 className="text-white font-bold text-xl">Simulated Logistic Regression</h3>
            <p className="text-sm leading-relaxed max-w-2xl">
              The confirmation probability engine utilizes a weighted factor analysis to determine the stability of a booking.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
              <p className="text-blue-400 font-black text-[10px] uppercase mb-1">Lead Time (0.5x)</p>
              <p className="text-xs">Closer dates = Higher commitment.</p>
            </div>
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
              <p className="text-green-400 font-black text-[10px] uppercase mb-1">Weekends (+5%)</p>
              <p className="text-xs">High demand reduces cancellations.</p>
            </div>
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
              <p className="text-amber-400 font-black text-[10px] uppercase mb-1">Occupancy (1.0x)</p>
              <p className="text-xs">Scarcity increases perceived value.</p>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-white font-bold text-xs uppercase tracking-widest">Training Reference (JSON)</p>
            <div className="bg-black/40 p-6 rounded-2xl font-mono text-xs border border-white/5 overflow-x-auto">
              <pre>{JSON.stringify(PREDICTION_DOCS.mockDataset, null, 2)}</pre>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DocsPage;
