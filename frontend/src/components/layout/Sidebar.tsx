import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  PlusCircle,
  FolderArchive,
  Settings,
  LogOut,
  Zap,
  X,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../lib/utils';

export interface SidebarProps {
  mobileOpen?: boolean;
  setMobileOpen?: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, setMobileOpen }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/app/dashboard', icon: LayoutDashboard },
    { label: 'New Analysis', path: '/app/new-analysis', icon: PlusCircle, badge: 'AI' },
    { label: 'Previous Analyses', path: '/app/history', icon: FolderArchive },
    { label: 'Settings', path: '/app/settings', icon: Settings },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-[#E5E7EB] text-[#111827] w-64 select-none">
      {/* Top Header & Logo */}
      <div className="flex items-center justify-between p-5 border-b border-[#E5E7EB]/80">
        <NavLink to="/app/dashboard" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-2xl bg-[#2563EB] flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform duration-200">
            <Zap className="w-5 h-5 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg tracking-tight text-[#111827]">RootCause</span>
              <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-md bg-blue-100 text-blue-700 tracking-wider">
                AI
              </span>
            </div>
            <p className="text-[11px] text-[#6B7280]">Bug Analysis Engine</p>
          </div>
        </NavLink>
        {setMobileOpen && (
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Quick Action Hero Widget in Sidebar */}
      <div className="p-4">
        <NavLink
          to="/app/new-analysis"
          onClick={() => setMobileOpen && setMobileOpen(false)}
          className="w-full flex items-center justify-between p-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl shadow-md shadow-blue-500/20 hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 group"
        >
          <div className="flex items-center gap-2.5">
            <PlusCircle className="w-5 h-5 text-white/90 group-hover:rotate-90 transition-transform duration-300" />
            <span className="text-sm font-semibold">New Bug Analysis</span>
          </div>
          <ChevronRight className="w-4 h-4 text-white/70 group-hover:translate-x-0.5 transition-transform" />
        </NavLink>
      </div>

      {/* Main Navigation Links */}
      <div className="flex-1 px-3 py-2 space-y-1.5 overflow-y-auto">
        <p className="px-3 text-[11px] font-bold text-[#6B7280] uppercase tracking-wider mb-2">
          Navigation
        </p>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen && setMobileOpen(false)}
              className={({ isActive }) =>
                cn(
                  'relative flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-sm font-medium transition-all duration-200 group',
                  isActive
                    ? 'bg-blue-50 text-[#2563EB] font-semibold border border-blue-200/60 shadow-sm'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3">
                    <Icon
                      className={cn(
                        'w-4 h-4 transition-colors',
                        isActive ? 'text-[#2563EB]' : 'text-slate-400 group-hover:text-slate-600',
                      )}
                    />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={cn(
                        'text-[10px] font-extrabold px-2 py-0.5 rounded-full',
                        isActive ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700',
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                  {isActive && (
                    <motion.div
                      layoutId="sidebarActiveIndicator"
                      className="absolute left-0 top-2 bottom-2 w-1 bg-[#2563EB] rounded-r-full"
                    />
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* User Section & Logout Pinned at Bottom */}
      <div className="p-4 border-t border-[#E5E7EB] bg-slate-50/50">
        <div className="flex items-center justify-between p-2 rounded-2xl bg-white border border-[#E5E7EB] shadow-sm">
          <div className="flex items-center gap-3 overflow-hidden">
            <img
              src={
                user?.avatarUrl ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256'
              }
              alt={user?.name}
              className="w-9 h-9 rounded-xl object-cover border border-slate-200 shrink-0"
            />
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-[#111827] truncate">
                {user?.name || 'Alex Rivera'}
              </p>
              <p className="text-[11px] text-[#6B7280] truncate">
                {user?.email || 'alex@techcorp.io'}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Logout"
            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden md:flex fixed top-0 left-0 bottom-0 z-30 h-full">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm"
            onClick={() => setMobileOpen && setMobileOpen(false)}
          />
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative z-10 h-full"
          >
            {sidebarContent}
          </motion.div>
        </div>
      )}
    </>
  );
};
