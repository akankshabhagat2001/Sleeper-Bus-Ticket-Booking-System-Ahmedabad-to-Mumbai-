
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { MessageSquare, X, Send, Bot, Sparkles, Minus, ExternalLink, MapPin, Info } from 'lucide-react';
import { STATIONS, MEALS } from '../constants';

interface GroundingSource {
  title: string;
  uri: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: GroundingSource[];
}

const AIAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Namaste! I'm your SleeperSwift Concierge. I'm now connected to Google Search and Maps to give you real-time highway updates and local recommendations. How can I help with your Ahmedabad to Mumbai journey today?" }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const getUserLocation = (): Promise<{ latitude: number; longitude: number } | null> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) return resolve(null);
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
        () => resolve(null),
        { timeout: 5000 }
      );
    });
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const location = await getUserLocation();
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const stationsList = STATIONS.map(s => `${s.name}`).join(', ');
      const mealsList = MEALS.map(m => `${m.name} (${m.category}): ₹${m.price}`).join('; ');

      const systemInstruction = `
        You are the "SleeperSwift Concierge", an expert travel agent for the Ahmedabad-Mumbai sleeper bus route.
        Current Route: ${stationsList}.
        Available Meals: ${mealsList}.
        
        Capabilities:
        1. Use Google Search to provide REAL-TIME updates on NH48 traffic, weather in Mumbai/Ahmedabad, or station news.
        2. Use Google Maps to find specific places (restaurants, ATMs, hotels) near the boarding/dropping points.
        3. Advise on seats: Lower for accessibility/elderly, Upper for privacy/younger travelers.
        
        Style: Professional, helpful, concise. Always prioritize safety and passenger comfort.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: userMessage,
        config: {
          systemInstruction,
          tools: [
            { googleSearch: {} },
            { googleMaps: {} }
          ],
          toolConfig: location ? {
            retrievalConfig: {
              latLng: {
                latitude: location.latitude,
                longitude: location.longitude
              }
            }
          } : undefined
        },
      });

      // Extract text content
      const aiText = response.text || "I'm sorry, I couldn't process that. Please try again.";
      
      // Extract grounding sources (citations)
      const sources: GroundingSource[] = [];
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (chunks) {
        chunks.forEach((chunk: any) => {
          if (chunk.web) {
            sources.push({ title: chunk.web.title, uri: chunk.web.uri });
          } else if (chunk.maps) {
            sources.push({ title: chunk.maps.title, uri: chunk.maps.uri });
          }
        });
      }

      // Deduplicate sources by URI
      const uniqueSources = Array.from(new Map(sources.map(s => [s.uri, s])).values());

      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: aiText,
        sources: uniqueSources.length > 0 ? uniqueSources : undefined
      }]);
    } catch (error) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, { role: 'assistant', content: "I'm having a bit of trouble connecting to my live data sources. Please try again in a moment!" }]);
    } finally {
      setIsLoading(false);
    }
  };

  const QuickAction = ({ text, icon: Icon }: { text: string, icon?: any }) => (
    <button 
      onClick={() => { setInput(text); }}
      className="text-[10px] font-bold px-3 py-2 rounded-xl bg-white text-slate-700 border border-slate-200 hover:border-blue-400 hover:text-blue-600 transition-all whitespace-nowrap flex items-center gap-1.5 shadow-sm"
    >
      {Icon && <Icon size={12} />}
      {text}
    </button>
  );

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-500 z-50 ${
          isOpen ? 'bg-slate-900 rotate-90 scale-90' : 'bg-blue-600 hover:scale-110 hover:bg-blue-700'
        }`}
      >
        {isOpen ? <X className="text-white" /> : <MessageSquare className="text-white" />}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-4 border-slate-50 animate-pulse" />
        )}
      </button>

      <div className={`fixed bottom-24 right-6 w-[95vw] md:w-[400px] max-h-[80vh] flex flex-col bg-white border border-slate-100 rounded-[2.5rem] shadow-2xl z-50 transition-all duration-500 transform ${
        isOpen ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-12 opacity-0 scale-95 pointer-events-none'
      } overflow-hidden`}>
        {/* Animated Header */}
        <div className="p-6 bg-slate-900 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Bot size={20} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-black text-white uppercase tracking-widest">Swift Concierge</p>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1">
                   Search & Maps Online
                </p>
              </div>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/5 text-white/40 hover:bg-white/10 hover:text-white transition-colors">
            <Minus size={18} />
          </button>
        </div>

        {/* Messages Area */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
          {messages.map((msg, i) => (
            <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} space-y-2`}>
              <div className={`max-w-[90%] p-4 rounded-3xl text-sm leading-relaxed ${
                msg.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-tr-none shadow-xl shadow-blue-500/20' 
                  : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none shadow-sm'
              }`}>
                {msg.content}
                
                {/* Grounding Sources */}
                {msg.sources && (
                  <div className="mt-4 pt-4 border-t border-slate-50 space-y-2">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                      <Info size={10} /> Verified Sources
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {msg.sources.map((source, idx) => (
                        <a 
                          key={idx}
                          href={source.uri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-2 py-1 bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-600 rounded-lg text-[10px] font-bold transition-colors border border-transparent hover:border-blue-100"
                        >
                          <ExternalLink size={10} />
                          <span className="max-w-[120px] truncate">{source.title}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white p-4 rounded-3xl border border-slate-100 flex items-center gap-3 shadow-sm">
                <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Consulting Google API...</span>
              </div>
            </div>
          )}
        </div>

        {/* Action Tray & Input */}
        <div className="p-6 bg-white border-t border-slate-100 space-y-4">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <QuickAction text="Traffic on NH48?" icon={MapPin} />
            <QuickAction text="Mumbai Weather?" icon={Sparkles} />
            <QuickAction text="Food near Surat Stop?" icon={MapPin} />
          </div>
          <div className="relative group">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask about traffic, weather, or places..."
              className="w-full h-14 pl-5 pr-14 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all shadow-inner"
            />
            <button 
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="absolute right-2 top-2 w-10 h-10 flex items-center justify-center bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-all shadow-lg shadow-blue-500/20 active:scale-90"
            >
              <Send size={18} />
            </button>
          </div>
          <p className="text-[8px] text-center text-slate-400 font-bold uppercase tracking-widest">
            Always verify real-time data with bus conductor
          </p>
        </div>
      </div>
    </>
  );
};

export default AIAssistant;
