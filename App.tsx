
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { BusFront, LayoutDashboard, Info, User, ChevronRight, Menu, ShieldCheck, Lock, LogIn, LogOut, ExternalLink } from 'lucide-react';
import BookingPage from './pages/BookingPage';
import DashboardPage from './pages/DashboardPage';
import HomePage from './pages/HomePage';
import DocsPage from './pages/DocsPage';
import AdminPage from './pages/AdminPage';
import LoginPage from './pages/LoginPage';
import AIAssistant from './components/AIAssistant';

// Role-based access types
type UserRole = 'admin' | 'user';

const AccessDenied = () => (
  <div className="h-[60vh] flex flex-col items-center justify-center text-center space-y-6 animate-in fade-in zoom-in duration-500">
    <div className="w-24 h-24 bg-red-50 text-red-500 rounded-full flex items-center justify-center ring-8 ring-red-50/50">
      <Lock size={48} />
    </div>
    <div className="space-y-2">
      <h2 className="text-3xl font-black text-slate-900">Access Restricted</h2>
      <p className="text-slate-500 max-w-sm mx-auto">This area is reserved for authorized system administrators. Please sign in to proceed.</p>
    </div>
    <div className="flex flex-col sm:flex-row gap-3">
        <Link to="/login" className="px-8 py-3 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all flex items-center gap-2">
          <LogIn size={18} /> Admin Login
        </Link>
        <Link to="/" className="px-8 py-3 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-all">
          Back Home
        </Link>
    </div>
  </div>
);

const Sidebar = ({ isOpen, onClose, userRole, onLogout }: { isOpen: boolean, onClose: () => void, userRole: UserRole, onLogout: () => void }) => {
  const navItems = [
    { icon: <BusFront size={20} />, label: 'Book Tickets', path: '/', adminOnly: false },
    { icon: <LayoutDashboard size={20} />, label: 'My Dashboard', path: '/dashboard', adminOnly: false },
    { icon: <ShieldCheck size={20} />, label: 'Admin Panel', path: '/admin', adminOnly: true },
    { icon: <Info size={20} />, label: 'Documentation', path: '/docs', adminOnly: false },
  ];

  const filteredItems = navItems.filter(item => !item.adminOnly || userRole === 'admin');

  return (
    <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out md:translate-x-0 shadow-2xl md:shadow-none`}>
      <div className="flex flex-col h-full">
        <div className="p-6 flex items-center gap-3 border-b border-slate-800">
          <div className="bg-blue-600 p-2 rounded-lg">
            <BusFront className="text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">SleeperSwift</span>
        </div>
        
        <nav className="flex-1 px-4 py-8 space-y-2">
          {filteredItems.map((item) => (
            <Link 
              key={item.path} 
              to={item.path} 
              onClick={onClose}
              className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-slate-800 transition-all group"
            >
              <span className={`transition-colors ${item.adminOnly ? 'text-amber-400' : 'text-slate-400 group-hover:text-blue-400'}`}>
                {item.icon}
              </span>
              <span className="font-medium text-slate-200">{item.label}</span>
              <ChevronRight size={16} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          ))}
        </nav>

        {/* User Profile / Admin Transition */}
        <div className="p-6 border-t border-slate-800 space-y-4">
          <div className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${userRole === 'admin' ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-slate-800/50 border border-transparent'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${userRole === 'admin' ? 'bg-amber-500 text-slate-900' : 'bg-blue-500/20 text-blue-400'}`}>
              {userRole === 'admin' ? <ShieldCheck size={20} /> : <User size={20} />}
            </div>
            <div className="overflow-hidden">
              <p className={`text-sm font-semibold truncate ${userRole === 'admin' ? 'text-amber-400' : 'text-slate-100'}`}>
                {userRole === 'admin' ? 'System Admin' : 'Guest Traveler'}
              </p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                {userRole === 'admin' ? 'Master Access' : 'Personal Account'}
              </p>
            </div>
          </div>
          
          {userRole === 'admin' ? (
              <button 
                onClick={onLogout}
                className="w-full py-2.5 bg-slate-800 text-slate-400 border border-slate-700 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 transition-all"
              >
                <LogOut size={14} /> Log Out
              </button>
          ) : (
              <Link 
                to="/login"
                onClick={onClose}
                className="w-full py-2.5 bg-blue-600/10 text-blue-400 border border-blue-500/30 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-blue-600/20 hover:border-blue-500/50 transition-all"
              >
                <ExternalLink size={14} /> Admin Portal
              </Link>
          )}
        </div>
      </div>
    </aside>
  );
};

const Header = ({ onOpenSidebar }: { onOpenSidebar: () => void }) => (
  <header className="sticky top-0 z-40 w-full h-16 glass border-b border-slate-200 px-4 flex items-center justify-between md:hidden">
    <button onClick={onOpenSidebar} className="p-2 text-slate-600">
      <Menu />
    </button>
    <div className="flex items-center gap-2">
      <BusFront className="text-blue-600" />
      <span className="font-bold text-lg">SleeperSwift</span>
    </div>
    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 shadow-sm" />
  </header>
);

const App: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>(() => {
    return (localStorage.getItem('ss_role') as UserRole) || 'user';
  });

  // Listen for login/logout events from other components
  useEffect(() => {
    const handleAuthChange = () => {
      const updatedRole = (localStorage.getItem('ss_role') as UserRole) || 'user';
      setUserRole(updatedRole);
    };

    window.addEventListener('auth-change', handleAuthChange);
    return () => window.removeEventListener('auth-change', handleAuthChange);
  }, []);

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to end your admin session?")) {
        localStorage.removeItem('ss_role');
        setUserRole('user');
        window.location.hash = '#/';
    }
  };

  return (
    <HashRouter>
      <div className="min-h-screen flex flex-col md:flex-row">
        <Sidebar 
            isOpen={isSidebarOpen} 
            onClose={() => setIsSidebarOpen(false)} 
            userRole={userRole}
            onLogout={handleLogout}
        />
        
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        <main className="flex-1 md:ml-64 relative bg-slate-50">
          <Header onOpenSidebar={() => setIsSidebarOpen(true)} />
          <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-screen">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/book/:from/:to" element={<BookingPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/login" element={<LoginPage />} />
              
              {/* Protected Route */}
              <Route 
                path="/admin" 
                element={userRole === 'admin' ? <AdminPage /> : <AccessDenied />} 
              />
              
              <Route path="/docs" element={<DocsPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
          <AIAssistant />
        </main>
      </div>
    </HashRouter>
  );
};

export default App;
