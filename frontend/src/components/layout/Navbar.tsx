import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Bell,
  Plus,
  Menu,
  CheckCheck,
  ExternalLink,
  Zap,
  User,
  Shield,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAnalysis } from '../../context/AnalysisContext';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';

export interface NavbarProps {
  onOpenMobileSidebar: () => void;
  onOpenSearch: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenMobileSidebar, onOpenSearch }) => {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markNotificationAsRead, clearAllNotifications } =
    useAnalysis();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-20 h-16 bg-white/80 backdrop-blur-md border-b border-[#E5E7EB] px-4 md:px-8 flex items-center justify-between">
      {/* Left Mobile Menu Trigger & Search Bar */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          className="md:hidden p-2 text-slate-500 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Bar Button */}
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-3 bg-slate-100/80 hover:bg-slate-100 text-slate-500 hover:text-slate-800 text-xs px-3.5 py-2 rounded-2xl border border-slate-200/80 transition-all duration-200 w-48 sm:w-72 shadow-inner"
        >
          <Search className="w-4 h-4 text-slate-400" />
          <span className="truncate">Search bug reports, logs...</span>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 ml-auto text-[10px] font-mono bg-white px-1.5 py-0.5 rounded-md border border-slate-200 text-slate-400">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right Action Icons & User Controls */}
      <div className="flex items-center gap-3">
        {/* Quick New Analysis Button */}
        <Button
          size="sm"
          variant="primary"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => navigate('/app/new-analysis')}
          className="hidden sm:inline-flex"
        >
          New Analysis
        </Button>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowUserMenu(false);
            }}
            className="relative p-2.5 text-slate-500 hover:text-slate-800 rounded-2xl hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-blue-600 rounded-full ring-2 ring-white animate-pulse" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-[#E5E7EB] z-50 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#E5E7EB] bg-slate-50/50">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-[#111827]">Notifications</h4>
                  {unreadCount > 0 && (
                    <Badge variant="primary" size="sm">
                      {unreadCount} new
                    </Badge>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={clearAllNotifications}
                    className="text-[11px] font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-[#6B7280]">
                    No notifications yet.
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        markNotificationAsRead(n.id);
                        if (n.analysisId) {
                          navigate(`/app/history/${n.analysisId}`);
                          setShowNotifications(false);
                        }
                      }}
                      className={`p-4 text-xs transition-colors cursor-pointer hover:bg-slate-50 ${
                        !n.read ? 'bg-blue-50/40' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Zap className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span className="font-semibold text-[#111827]">{n.title}</span>
                        </div>
                        <span className="text-[10px] text-[#6B7280] shrink-0">{n.timestamp}</span>
                      </div>
                      <p className="text-slate-600 mt-1 line-clamp-2">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Avatar Popover */}
        <div className="relative">
          <button
            onClick={() => {
              setShowUserMenu(!showUserMenu);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2 p-1 rounded-2xl hover:bg-slate-100 transition-colors border border-slate-200/80"
          >
            <img
              src={
                user?.avatarUrl ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256'
              }
              alt={user?.name}
              className="w-8 h-8 rounded-xl object-cover"
            />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-[#E5E7EB] z-50 p-2 text-xs">
              <div className="p-3 border-b border-slate-100 mb-1">
                <p className="font-semibold text-[#111827]">{user?.name}</p>
                <p className="text-[#6B7280] truncate">{user?.email}</p>
              </div>

              <button
                onClick={() => {
                  navigate('/app/settings');
                  setShowUserMenu(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <User className="w-4 h-4 text-slate-400" /> Account Profile
              </button>

              <button
                onClick={() => {
                  navigate('/app/settings');
                  setShowUserMenu(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <Shield className="w-4 h-4 text-slate-400" /> API Keys & Security
              </button>

              <div className="my-1 border-t border-slate-100" />

              <button
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors font-medium"
              >
                <LogOut className="w-4 h-4 text-red-500" /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
