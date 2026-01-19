
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShieldCheck, Lock, User, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Simulated Admin Credentials
  const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'sleeper123'
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate network delay
    setTimeout(() => {
      if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        localStorage.setItem('ss_role', 'admin');
        // Trigger a custom event so App.tsx knows to update state
        window.dispatchEvent(new Event('auth-change'));
        
        const from = (location.state as any)?.from?.pathname || '/admin';
        navigate(from, { replace: true });
      } else {
        setError('Invalid username or password. Access denied.');
        setIsLoading(false);
      }
    }, 1200);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-in fade-in zoom-in duration-500">
        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-blue-500/10 border border-slate-100 overflow-hidden">
          {/* Decorative Header */}
          <div className="bg-slate-900 p-10 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-10">
              <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[radial-gradient(circle,white_1px,transparent_1px)] [background-size:20px_20px]" />
            </div>
            <div className="relative z-10 space-y-3">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-blue-500/40">
                <ShieldCheck className="text-white" size={32} />
              </div>
              <h1 className="text-2xl font-black text-white tracking-tight">SleeperSwift</h1>
              <p className="text-blue-400 text-xs font-bold uppercase tracking-[0.2em]">Admin Portal Access</p>
            </div>
          </div>

          <div className="p-10 space-y-8">
            <div className="space-y-2 text-center">
              <h2 className="text-xl font-bold text-slate-900">Sign In</h2>
              <p className="text-slate-500 text-sm">Enter your credentials to manage the fleet.</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 p-4 rounded-xl flex items-center gap-3 text-red-600 animate-in shake duration-300">
                <AlertCircle size={20} className="shrink-0" />
                <p className="text-sm font-bold">{error}</p>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Username</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors">
                    <User size={18} />
                  </div>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter admin username"
                    className="w-full h-14 pl-12 pr-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-300"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors">
                    <Lock size={18} />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-14 pl-12 pr-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-300"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    Authorize Access <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            <div className="pt-4 text-center">
              <p className="text-xs text-slate-400 font-medium">
                Protected by SleeperSwift Security. <br />
                Unauthorized access is strictly prohibited.
              </p>
            </div>
          </div>
        </div>

        {/* Development Tip (Removable for production) */}
        <div className="mt-8 p-4 bg-blue-50/50 border border-blue-100 rounded-2xl text-center">
          <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-1">Demo Credentials</p>
          <p className="text-xs text-blue-800">User: <span className="font-bold">admin</span> | Pass: <span className="font-bold">sleeper123</span></p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
