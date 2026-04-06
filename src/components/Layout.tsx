import { useState, useRef, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, User, LayoutDashboard, Settings, LogOut, ChevronRight, Lightbulb, BarChart3 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useUser } from '../context/UserContext';

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useUser();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen pb-32">
      {/* TopAppBar */}
      <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md flex items-center px-6 h-16 border-b border-outline-variant/10">
        <div className="flex items-center">
          <button className="p-2 rounded-full hover:bg-surface-container-high transition-colors">
            <Menu className="w-6 h-6 text-primary" />
          </button>
        </div>
        
        <h1 className="absolute left-1/2 -translate-x-1/2 font-headline font-bold text-primary text-xl tracking-tight">
          一宸国学文化
        </h1>

        <div className="ml-auto flex items-center gap-4 relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className={`p-2 rounded-full transition-all duration-200 ${
              isProfileOpen ? 'bg-primary text-on-primary shadow-lg scale-110' : 'hover:bg-surface-container-high text-primary'
            }`}
          >
            <User className="w-6 h-6" />
          </button>

          <AnimatePresence>
            {isProfileOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 top-full mt-2 w-56 bg-surface-container-low rounded-2xl shadow-2xl border border-outline-variant/10 overflow-hidden z-[60]"
              >
                <div className="p-4 border-b border-outline-variant/10 bg-surface-container-high/30">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden border border-primary/20">
                      <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-on-surface">{user.name}</p>
                      <p className="text-[10px] text-secondary font-medium">{user.position}</p>
                    </div>
                  </div>
                </div>
                <div className="p-2">
                  <button
                    onClick={() => {
                      navigate('/profile/settings');
                      setIsProfileOpen(false);
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-primary/5 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <Settings className="w-4 h-4 text-secondary group-hover:text-primary" />
                      <span className="text-sm font-bold text-on-surface-variant group-hover:text-primary">系统设置</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-outline/40 group-hover:text-primary" />
                  </button>
                  <div className="h-px bg-outline-variant/10 my-1 mx-2" />
                  <button
                    onClick={() => {
                      logout();
                      navigate('/login');
                      setIsProfileOpen(false);
                    }}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-error/5 text-error transition-colors group"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm font-black">退出登录</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      <main className="pt-24 px-6 max-w-7xl mx-auto">
        <Outlet />
      </main>

      {/* BottomNavBar */}
      <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center h-20 px-2 pb-safe bg-background/90 backdrop-blur-xl z-50 rounded-t-xl border-t border-primary/10 shadow-[0_-4px_30px_rgba(0,0,0,0.05)]">
        <Link
          to="/"
          className={`flex flex-col items-center justify-center px-4 py-2 rounded-full transition-all duration-200 ${
            location.pathname === '/' ? 'bg-primary text-on-primary' : 'text-secondary hover:text-primary'
          }`}
        >
          <LayoutDashboard className="w-6 h-6" />
          <span className="font-label text-[10px] font-bold uppercase tracking-widest mt-1 whitespace-nowrap">工作台</span>
        </Link>
        <Link
          to="/sales-techniques"
          className={`flex flex-col items-center justify-center px-4 py-2 rounded-full transition-all duration-200 ${
            location.pathname === '/sales-techniques' ? 'bg-primary text-on-primary' : 'text-secondary hover:text-primary'
          }`}
        >
          <Lightbulb className="w-6 h-6" />
          <span className="font-label text-[10px] font-bold uppercase tracking-widest mt-1 whitespace-nowrap">销售技巧</span>
        </Link>
        <Link
          to="/management"
          className={`flex flex-col items-center justify-center px-4 py-2 rounded-full transition-all duration-200 ${
            location.pathname === '/management' ? 'bg-primary text-on-primary' : 'text-secondary hover:text-primary'
          }`}
        >
          <BarChart3 className="w-6 h-6" />
          <span className="font-label text-[10px] font-bold uppercase tracking-widest mt-1 whitespace-nowrap">管理中心</span>
        </Link>
        <Link
          to="/profile"
          className={`flex flex-col items-center justify-center px-4 py-2 rounded-full transition-all duration-200 ${
            location.pathname === '/profile' ? 'bg-primary text-on-primary' : 'text-secondary hover:text-primary'
          }`}
        >
          <User className="w-6 h-6" />
          <span className="font-label text-[10px] font-bold uppercase tracking-widest mt-1 whitespace-nowrap">个人中心</span>
        </Link>
      </nav>
    </div>
  );
}
