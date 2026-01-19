
import React, { useState } from 'react';
import { HashRouter, Routes, Route, Link } from 'react-router-dom';
import { BusFront, LayoutDashboard, Info, User, ChevronRight, Menu, ShieldCheck } from 'lucide-react';
import BookingPage from './pages/BookingPage';
import DashboardPage from './pages/DashboardPage';
import HomePage from './pages/HomePage';
import DocsPage from './pages/DocsPage';
import AdminPage from './pages/AdminPage';
import AIAssistant from './components/AIAssistant';

const Sidebar = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const navItems = [
    { icon: <BusFront size={20} />, label: 'Book Tickets', path: '/' },
    { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/dashboard' },
    { icon: <ShieldCheck size={20} />, label: 'Admin Panel', path: '/admin' },
    { icon: <Info size={20} />, label: 'Documentation', path: '/docs' },
  ];

  return (
    <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out md:translate-x-0`}>
      <div className="flex flex-col h-full">
        <div className="p-6 flex items-center gap-3 border-b border-slate-800">
          <div className="bg-blue-600 p-2 rounded-lg">
            <BusFront className="text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">SleeperSwift</span>
        </div>
        
        <nav className="flex-1 px-4 py-8 space-y-2">
          {navItems.map((item) => (
            <Link 
              key={item.path} 
              to={item.path} 
              onClick={onClose}
              className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-slate-800 transition-colors group"
            >
              <span className="text-slate-400 group-hover:text-blue-400 transition-colors">{item.icon}</span>
              <span className="font-medium text-slate-200">{item.label}</span>
              <ChevronRight size={16} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          ))}
        </nav>

        <div className="p-6 border-t border-slate-800">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50">
            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
              <User size={20} className="text-blue-400" />
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold truncate text-slate-100">AI Engineer</p>
              <p className="text-xs text-slate-400 truncate">Admin Access</p>
            </div>
          </div>
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
    <div className="w-10 h-10 rounded-full bg-blue-100" />
  </header>
);

const App: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <HashRouter>
      <div className="min-h-screen flex flex-col md:flex-row">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        <main className="flex-1 md:ml-64 relative">
          <Header onOpenSidebar={() => setIsSidebarOpen(true)} />
          <div className="p-4 md:p-8 max-w-7xl mx-auto">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/book/:from/:to" element={<BookingPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/docs" element={<DocsPage />} />
            </Routes>
          </div>
          <AIAssistant />
        </main>
      </div>
    </HashRouter>
  );
};

export default App;
