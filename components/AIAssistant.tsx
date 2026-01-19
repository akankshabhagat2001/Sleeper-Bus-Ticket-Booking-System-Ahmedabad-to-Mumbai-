
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { MessageSquare, X, Send, Bot, Sparkles, Minus, Maximize2 } from 'lucide-react';
import { STATIONS, MEALS } from '../constants';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const AIAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Namaste! I'm your SleeperSwift Concierge. How can I help you with your Ahmedabad to Mumbai journey today?" }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      // Corrected: Initialize GoogleGenAI with named parameter apiKey from process.env.API_KEY
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const stationsList = STATIONS.map(s => `${s.name} (T+${s.timeOffset} mins)`).join(', ');
      const mealsList = MEALS.map(m => `${m.name} (${m.category}): ${m.description} - ₹${m.price}`).join('; ');

      const systemInstruction = `
        You are the "SleeperSwift Concierge", a helpful and professional assistant for a premium sleeper bus service between Ahmedabad and Mumbai.
        Route Info: Starts at Ahmedabad (Gita Mandir) and ends at Mumbai (Borivali).
        Intermediate Stations: ${stationsList}.
        Meal Menu: ${mealsList}.
        Your goal is to help users with:
        1. Seat selection advice (Lower for accessibility, Upper for privacy).
        2. Meal recommendations based on their dietary needs (Veg, Non-Veg, Jain).
        3. Estimating arrival times at specific stations.
        4. General travel tips for this 11-hour journey.
        Keep responses concise, friendly, and helpful. Use Indian English context where appropriate.
      `;

      // Corrected: Use simple string for contents and specify model directly
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: userMessage,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      // Corrected: Access response text via the .text property
      const aiText = response.text || "I'm sorry, I couldn't process that. Please try again.";
      setMessages(prev => [...prev, { role: 'assistant', content: aiText }]);
    } catch (error) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, { role: 'assistant', content: "I'm having a bit of trouble connecting to my brain right now. Please try again in a moment!" }]);
    } finally {
      setIsLoading(false);
    }
  };

  const QuickAction = ({ text }: { text: string }) => (
    <button 
      onClick={() => { setInput(text); }}
      className="text-xs px-3 py-1.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-100 transition-colors whitespace-nowrap"
    >
      {text}
    </button>
  );

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 z-50 ${
          isOpen ? 'bg-slate-900 rotate-90' : 'bg-blue-600 hover:scale-110 hover:bg-blue-700'
        }`}
      >
        {isOpen ? <X className="text-white" /> : <MessageSquare className="text-white" />}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-pulse" />
        )}
      </button>

      {/* Chat Window */}
      <div className={`fixed bottom-24 right-6 w-[90vw] md:w-96 max-h-[70vh] flex flex-col glass border border-white/20 rounded-3xl shadow-2xl z-50 transition-all duration-500 transform ${
        isOpen ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0 pointer-events-none'
      }`}>
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-blue-600 rounded-t-3xl">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <Bot size={18} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">SleeperSwift Concierge</p>
              <p className="text-[10px] text-blue-100 flex items-center gap-1">
                <Sparkles size={10} /> Powered by Gemini
              </p>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-white/60 hover:text-white">
            <Minus size={20} />
          </button>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[300px]">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                msg.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-tr-none shadow-md shadow-blue-500/10' 
                  : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none shadow-sm'
              }`}>
                {msg.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white p-3 rounded-2xl border border-slate-100 flex gap-1">
                <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" />
                <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50/50 rounded-b-3xl space-y-3">
          {messages.length < 3 && (
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              <QuickAction text="What meals do you serve?" />
              <QuickAction text="Travel time to Mumbai?" />
              <QuickAction text="Best seat for sleep?" />
            </div>
          )}
          <div className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask anything about your trip..."
              className="w-full h-12 pl-4 pr-12 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-inner"
            />
            <button 
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="absolute right-2 top-2 w-8 h-8 flex items-center justify-center bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AIAssistant;
