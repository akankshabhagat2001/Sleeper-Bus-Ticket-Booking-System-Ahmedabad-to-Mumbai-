
import React from 'react';
// Fix: Add missing CheckCircle import
import { ClipboardList, ShieldCheck, BrainCircuit, Terminal, List, Bug, CheckCircle } from 'lucide-react';
import { PREDICTION_DOCS } from '../services/mlService';

const DocsPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20 animate-in fade-in duration-500">
      <section className="space-y-4">
        <h1 className="text-4xl font-extrabold text-slate-900">Project Documentation</h1>
        <p className="text-lg text-slate-500">Comprehensive overview of features, test architecture, and data science methodology for SleeperSwift.</p>
      </section>

      {/* 1. Core Features */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg text-white"><List size={20}/></div>
          <h2 className="text-2xl font-bold">1. Core Features</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { title: "Interactive Seat Layout", desc: "Graphical multi-deck visualization of the bus for easy selection of upper and lower berths." },
            { title: "Integrated Meal Booking", desc: "A gourmet meal marketplace within the checkout flow, featuring categories like Veg, Non-Veg, and Jain." },
            { title: "AI Confirmation Predictor", desc: "Real-time percentage-based confirmation probability calculated during the seat selection phase." },
            { title: "Dynamic Booking Dashboard", desc: "Centralized history tracking with one-click cancellation and real-time status updates." },
            { title: "Intermediate Stations Support", desc: "Flexible routing allowing bookings between any stations on the Ahmedabad → Mumbai stretch." },
            { title: "Real-time Availability Engine", desc: "Concurrent booking prevention with simulated asynchronous backend seat locking." }
          ].map((f, i) => (
            <div key={i} className="p-5 bg-white rounded-2xl border border-slate-100 space-y-2">
              <h3 className="font-bold text-slate-800">{f.title}</h3>
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
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 overflow-hidden">
            <h3 className="font-bold mb-4 text-slate-500 uppercase text-xs tracking-wider">Functional Testing</h3>
            <ul className="space-y-3">
              <li className="flex gap-3 text-sm"><CheckCircle className="text-green-500 flex-shrink-0" size={18}/> Verify that selected seats are marked as 'Occupied' for subsequent users.</li>
              <li className="flex gap-3 text-sm"><CheckCircle className="text-green-500 flex-shrink-0" size={18}/> Ensure meal prices are correctly aggregated into the final total amount.</li>
              <li className="flex gap-3 text-sm"><CheckCircle className="text-green-500 flex-shrink-0" size={18}/> Confirm that 'Cancel Booking' correctly releases the seat back to 'Available' status.</li>
            </ul>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-100 overflow-hidden">
            <h3 className="font-bold mb-4 text-slate-500 uppercase text-xs tracking-wider">Edge & UI/UX Case Testing</h3>
            <ul className="space-y-3">
              <li className="flex gap-3 text-sm"><Bug className="text-amber-500 flex-shrink-0" size={18}/> <b>Edge:</b> Attempt to book a seat that was just occupied by another session (Race Condition).</li>
              <li className="flex gap-3 text-sm"><Bug className="text-amber-500 flex-shrink-0" size={18}/> <b>UX:</b> Verify responsiveness of seat layout grid on 320px width mobile devices.</li>
              <li className="flex gap-3 text-sm"><Bug className="text-amber-500 flex-shrink-0" size={18}/> <b>ML:</b> Check if probability updates immediately when changing travel dates (Lead Time change).</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 3. ML Prediction Logic */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="bg-purple-600 p-2 rounded-lg text-white"><BrainCircuit size={20}/></div>
          <h2 className="text-2xl font-bold">3. Prediction Approach</h2>
        </div>
        <div className="bg-slate-900 text-slate-300 p-8 rounded-3xl space-y-6 shadow-2xl">
          <div className="space-y-2">
            <h3 className="text-white font-bold text-xl">Methodology</h3>
            <p className="text-sm leading-relaxed">
              We utilize a <b>Weighted Factor Scoring Model</b> simulating a logistic regression. 
              The system analyzes three primary variables to predict confirmation stability (the likelihood a booking will not be cancelled).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2 border-l border-slate-700 pl-4">
              <p className="text-white font-bold text-sm uppercase">Lead Time</p>
              <p className="text-xs">Closer travel dates indicate higher intent and lower cancellation probability.</p>
            </div>
            <div className="space-y-2 border-l border-slate-700 pl-4">
              <p className="text-white font-bold text-sm uppercase">Temporal Demand</p>
              <p className="text-xs">Weekend (Fri-Sun) bookings show 15% more stability due to high demand.</p>
            </div>
            <div className="space-y-2 border-l border-slate-700 pl-4">
              <p className="text-white font-bold text-sm uppercase">Bus Occupancy</p>
              <p className="text-xs">High occupancy triggers scarcity heuristics, reducing churn rates.</p>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-white font-bold text-sm uppercase">Mock Training Sample</h3>
            <div className="bg-black/50 p-4 rounded-xl font-mono text-xs overflow-x-auto">
              <pre>{JSON.stringify(PREDICTION_DOCS.mockDataset, null, 2)}</pre>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DocsPage;
