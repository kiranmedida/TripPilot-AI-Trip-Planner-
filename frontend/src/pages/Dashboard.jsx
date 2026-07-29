import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import Navbar from '../components/Navbar';
import { Calendar, MapPin, DollarSign, Plus, Compass, Trash2, Sparkles, AlertCircle, Trophy, Flame, Eye, ThumbsUp, Copy, MessageSquare } from 'lucide-react';

export const Dashboard = () => {
  const { user, refreshUser } = useAuth();
  const [trips, setTrips] = useState([]);
  const [feed, setFeed] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch user trips
      const tripsRes = await api.get('/trips');
      if (tripsRes.data.success) {
        setTrips(tripsRes.data.data.trips);
      }

      // Fetch achievements
      const achRes = await api.get('/goals/achievements');
      if (achRes.data.success) {
        setAchievements(achRes.data.data.achievements || []);
      }

      // Fetch community feed
      const feedRes = await api.get('/community/feed');
      if (feedRes.data.success) {
        setFeed(feedRes.data.data.templates || []);
      }
      
      // Refresh progress & streaks on load
      await api.post('/goals/check');
      refreshUser();
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError('Could not retrieve dashboard details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleDelete = async (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this trip itinerary?')) return;

    try {
      const res = await api.delete(`/trips/${id}`);
      if (res.data.success) {
        setTrips((prev) => prev.filter((t) => t._id !== id));
      }
    } catch (err) {
      alert('Failed to delete trip.');
    }
  };

  const handleClone = async (templateId, e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const res = await api.post(`/community/duplicate/${templateId}`);
      if (res.data.success) {
        alert('Trip template successfully cloned to your dashboard!');
        // Refresh trips list
        const tripsRes = await api.get('/trips');
        if (tripsRes.data.success) {
          setTrips(tripsRes.data.data.trips);
        }
      }
    } catch (err) {
      console.error(err);
      alert('Failed to clone trip template.');
    }
  };

  const handleLike = async (templateId, e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const res = await api.post(`/community/${templateId}/like`);
      if (res.data.success) {
        const { likesCount } = res.data.data;
        setFeed(prev => prev.map(t => t._id === templateId ? { ...t, likesCount } : t));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-200">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-10 space-y-12">
        {/* Upper Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* User Profile Card */}
          <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between lg:col-span-2 space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Traveler Profile</h2>
                <h1 className="text-3xl font-extrabold text-white mb-2">{user?.name}</h1>
                <p className="text-gray-400 text-sm">{user?.email}</p>
              </div>

              {/* Achievements Badges list */}
              <div className="flex flex-wrap gap-2 max-w-[200px]">
                {achievements.slice(0, 3).map((ach) => (
                  <span 
                    key={ach._id} 
                    className="inline-flex items-center gap-1 text-[10px] font-bold bg-yellow-400/10 text-yellow-400 border border-yellow-400/20 px-2 py-1 rounded-lg"
                    title={ach.title}
                  >
                    🏆 {ach.badgeCode === 'world_explorer' ? 'Explorer' : ach.badgeCode === 'beach_explorer' ? 'Beach Goer' : 'Planner'}
                  </span>
                ))}
                {achievements.length === 0 && (
                  <span className="text-[10px] text-gray-500 italic">No badges unlocked yet</span>
                )}
              </div>
            </div>
            
            {/* Limit counter widget */}
            <div className="border-t border-dark-border/40 pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-gray-400">Daily AI Generation Quota</span>
                  <span className="font-semibold text-white">
                    {user?.role === 'User' ? `${user?.usedToday} / ${user?.dailyLimit}` : 'Unlimited'}
                  </span>
                </div>
                
                {user?.role === 'User' ? (
                  <div className="w-full bg-slate-800 rounded-full h-1.5">
                    <div
                      className="bg-brand-primary h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (user?.usedToday / user?.dailyLimit) * 100)}%` }}
                    ></div>
                  </div>
                ) : (
                  <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 h-1.5 rounded-full w-full"></div>
                  </div>
                )}
              </div>

              {/* Gamification progress */}
              <div className="flex items-center gap-4">
                <div className="bg-slate-800/40 border border-dark-border/30 rounded-xl p-2 px-3 flex items-center gap-2">
                  <Flame className="h-5 w-5 text-orange-500 animate-pulse" />
                  <div className="flex flex-col">
                    <span className="text-[10px] text-gray-400 font-bold uppercase">Streak</span>
                    <span className="text-xs font-bold text-white">{user?.streakCount || 0} Days</span>
                  </div>
                </div>

                <div className="bg-slate-800/40 border border-dark-border/30 rounded-xl p-2 px-3 flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-400" />
                  <div className="flex flex-col">
                    <span className="text-[10px] text-gray-400 font-bold uppercase">Level</span>
                    <span className="text-xs font-bold text-white">Lvl {user?.level || 1} ({user?.xp || 0} XP)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between items-start">
            <div>
              <h3 className="text-lg font-bold text-white mb-2">Plan a New Adventure</h3>
              <p className="text-gray-400 text-sm mb-6">
                Use our AI travel generator to map out a complete day-by-day vacation itinerary.
              </p>
            </div>
            <button
              onClick={() => navigate('/trips/new')}
              className="w-full bg-brand-primary hover:bg-brand-secondary text-white font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all transform hover:scale-[1.01] cursor-pointer"
            >
              <Plus className="h-5 w-5" />
              Generate New Itinerary
            </button>
          </div>
        </div>

        {/* Trips List Area */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Compass className="h-6 w-6 text-brand-primary" />
            Saved Itineraries
          </h2>

          {loading ? (
            <div className="flex items-center justify-center py-10">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-primary border-t-transparent"></div>
            </div>
          ) : error ? (
            <div className="glass-panel p-8 rounded-2xl text-center text-red-400">{error}</div>
          ) : trips.length === 0 ? (
            <div className="glass-panel p-10 rounded-2xl text-center max-w-xl mx-auto">
              <Compass className="h-12 w-12 text-gray-500 mx-auto mb-4 animate-spin" style={{ animationDuration: '8s' }} />
              <h3 className="text-lg font-bold text-white mb-1">No Saved Trips Yet</h3>
              <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                Plan your travel styles, map budget layouts, and saving your perfect day-by-day guides.
              </p>
              <button
                onClick={() => navigate('/trips/new')}
                className="bg-brand-primary hover:bg-brand-secondary text-white font-semibold py-2.5 px-6 rounded-xl shadow-md transition-all cursor-pointer"
              >
                Generate Your First Trip
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trips.map((trip) => (
                <Link
                  key={trip._id}
                  to={`/trips/${trip._id}`}
                  className="glass-panel rounded-2xl overflow-hidden hover:border-brand-primary/50 transition-all flex flex-col justify-between group"
                >
                  <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-5 border-b border-dark-border/40">
                    <span className="text-xs font-semibold text-brand-primary bg-brand-primary/10 border border-brand-primary/20 px-2.5 py-1 rounded-full uppercase tracking-wider">
                      {trip.tripTemplate}
                    </span>
                    <h3 className="text-xl font-bold text-white mt-3 truncate group-hover:text-brand-primary transition-colors">
                      {trip.title}
                    </h3>
                  </div>

                  <div className="p-5 flex-grow space-y-3.5">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <MapPin className="h-4 w-4 text-gray-500 shrink-0" />
                      <span className="truncate">{trip.destination}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Calendar className="h-4 w-4 text-gray-500 shrink-0" />
                      <span>{trip.days} Days ({trip.travelStyle})</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <DollarSign className="h-4 w-4 text-gray-500 shrink-0" />
                      <span>Budget: <span className="text-white font-medium">{trip.budget} USD</span></span>
                    </div>
                  </div>

                  <div className="px-5 py-4 bg-slate-900/40 border-t border-dark-border/20 flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      Created {new Date(trip.createdAt).toLocaleDateString()}
                    </span>
                    <button
                      onClick={(e) => handleDelete(trip._id, e)}
                      className="text-gray-400 hover:text-red-400 p-1.5 rounded-lg hover:bg-red-500/10 transition-all cursor-pointer"
                      title="Delete Trip"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Community Section */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-yellow-400" />
            Community Shared Templates
          </h2>

          {loading ? (
            <div className="flex items-center justify-center py-10">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-primary border-t-transparent"></div>
            </div>
          ) : feed.length === 0 ? (
            <div className="glass-panel p-10 rounded-2xl text-center max-w-xl mx-auto text-gray-400 text-sm">
              No shared templates in the community yet. Be the first to share your trip details!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {feed.map((temp) => (
                <div
                  key={temp._id}
                  className="glass-panel rounded-2xl overflow-hidden border border-yellow-400/10 hover:border-yellow-400/30 transition-all flex flex-col justify-between"
                >
                  <div className="p-5 space-y-4 flex-grow">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-yellow-400 bg-yellow-400/10 px-2.5 py-1 rounded-full uppercase tracking-wider">
                        {temp.travelStyle}
                      </span>
                      <span className="text-[10px] text-gray-500">
                        by {temp.creatorId?.name || 'Globetrotter'} (Lvl {temp.creatorId?.level || 1})
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-white">{temp.title}</h3>
                    <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">{temp.description}</p>

                    <div className="space-y-2 pt-2 border-t border-dark-border/20">
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <MapPin className="h-3.5 w-3.5 text-gray-500" />
                        <span>{temp.destination}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <Calendar className="h-3.5 w-3.5 text-gray-500" />
                        <span>{temp.durationDays} Days</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions footer */}
                  <div className="px-5 py-3.5 bg-slate-900/60 border-t border-dark-border/20 flex items-center justify-between">
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <button 
                        onClick={(e) => handleLike(temp._id, e)} 
                        className="flex items-center gap-1 hover:text-yellow-400 transition-colors"
                      >
                        <ThumbsUp className="h-3.5 w-3.5 text-yellow-500" />
                        <span>{temp.likesCount}</span>
                      </button>

                      <div className="flex items-center gap-1">
                        <Copy className="h-3.5 w-3.5 text-blue-400" />
                        <span>{temp.clonesCount || 0} Clones</span>
                      </div>
                    </div>

                    <button
                      onClick={(e) => handleClone(temp._id, e)}
                      className="bg-brand-primary/20 hover:bg-brand-primary text-white border border-brand-primary/30 text-xs font-semibold px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <Copy className="h-3.5 w-3.5" />
                      Clone Trip
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default Dashboard;
