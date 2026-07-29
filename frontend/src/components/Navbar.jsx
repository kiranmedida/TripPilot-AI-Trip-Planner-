import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Compass, LogOut, Shield, Map, PlusCircle, Bell, Flame, Trophy, Check } from 'lucide-react';
import api from '../utils/api';

export const Navbar = () => {
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      if (res.data.success) {
        const list = res.data.data.notifications || [];
        setNotifications(list);
        setUnreadCount(list.filter(n => !n.isRead).length);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      // Poll every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const markAllRead = async () => {
    try {
      await api.post('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  if (!user) return null;

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 glass-panel border-b border-dark-border px-6 py-3.5 shadow-lg">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        {/* Brand Logo */}
        <Link to="/dashboard" className="flex items-center gap-2 text-2xl font-bold tracking-tight text-white hover:opacity-90">
          <Compass className="h-7 w-7 text-brand-primary animate-pulse" />
          <span>Trip<span className="text-brand-primary">Pilot</span></span>
        </Link>

        {/* Navigation Pathways */}
        <div className="flex items-center gap-6">
          <Link
            to="/dashboard"
            className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
              isActive('/dashboard') ? 'text-brand-primary' : 'text-gray-300 hover:text-white'
            }`}
          >
            <Map className="h-4 w-4" />
            Dashboard
          </Link>
          <Link
            to="/trips/new"
            className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
              isActive('/trips/new') ? 'text-brand-primary' : 'text-gray-300 hover:text-white'
            }`}
          >
            <PlusCircle className="h-4 w-4" />
            Generate Trip
          </Link>

          {user.role === 'Admin' && (
            <Link
              to="/admin"
              className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
                isActive('/admin') ? 'text-yellow-500' : 'text-gray-300 hover:text-yellow-500'
              }`}
            >
              <Shield className="h-4 w-4" />
              Admin
            </Link>
          )}
        </div>

        {/* Gamified Level & Streaks Display */}
        <div className="hidden md:flex items-center gap-5 border-l border-r border-dark-border/40 px-6 py-1">
          {/* Level Tracker */}
          <div className="flex items-center gap-2" title={`${user.xp % 100} / 100 XP to next level`}>
            <Trophy className="h-4 w-4 text-yellow-400" />
            <div className="flex flex-col">
              <span className="text-xs font-bold text-gray-300">Level {user.level || 1}</span>
              <div className="w-16 bg-slate-800 rounded-full h-1 mt-0.5">
                <div 
                  className="bg-yellow-400 h-1 rounded-full" 
                  style={{ width: `${user.xp % 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Streak Tracker */}
          <div className="flex items-center gap-1.5" title="Consecutive days active">
            <Flame className={`h-4.5 w-4.5 ${user.streakCount > 0 ? 'text-orange-500 animate-bounce' : 'text-gray-500'}`} />
            <span className="text-xs font-extrabold text-gray-300">{user.streakCount || 0} Day Streak</span>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4 relative">
          
          {/* Notifications Trigger */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg bg-slate-800/40 border border-dark-border/30 text-gray-300 hover:text-white transition-all cursor-pointer"
            >
              <Bell className="h-4.5 w-4.5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Popover */}
            {showNotifications && (
              <div className="absolute right-0 mt-2.5 w-80 rounded-2xl border border-dark-border bg-[#0d1627] shadow-xl p-4 z-50 space-y-3">
                <div className="flex items-center justify-between border-b border-dark-border/40 pb-2">
                  <h4 className="text-sm font-bold text-white">Notifications</h4>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="text-[11px] font-semibold text-brand-primary hover:text-brand-secondary"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {notifications.length === 0 ? (
                    <p className="text-xs text-gray-500 text-center py-4">No notifications yet.</p>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n._id}
                        onClick={() => handleRead(n._id)}
                        className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all ${
                          n.isRead
                            ? 'bg-slate-900/10 border-slate-900/20 text-gray-400'
                            : 'bg-slate-900/60 border-brand-primary/20 hover:border-brand-primary/40 text-gray-200'
                        }`}
                      >
                        <div className="flex justify-between items-start gap-1">
                          <span className="text-[11px] font-bold text-white">{n.title}</span>
                          {!n.isRead && <span className="h-1.5 w-1.5 rounded-full bg-brand-primary shrink-0 mt-1"></span>}
                        </div>
                        <p className="text-[10px] leading-relaxed mt-1 text-gray-400">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col items-end">
            <span className="text-sm font-semibold text-white">{user.name}</span>
            <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
              user.role === 'Admin' 
                ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                : user.role === 'Premium' 
                ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' 
                : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
            }`}>
              {user.role}
            </span>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center justify-center rounded-lg bg-slate-800 p-2.5 text-gray-300 hover:bg-red-600 hover:text-white transition-all cursor-pointer"
            title="Sign Out"
          >
            <LogOut className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>
    </nav>
  );
};
export default Navbar;
