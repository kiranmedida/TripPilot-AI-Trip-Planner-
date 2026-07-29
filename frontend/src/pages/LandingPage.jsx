import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Sparkles, Shield, RefreshCw, Star } from 'lucide-react';

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-200 flex flex-col justify-between">
      {/* Header Promo Area */}
      <header className="px-6 py-6 border-b border-dark-border/40 bg-dark-bg/60 sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 text-2xl font-bold tracking-tight text-white">
            <Compass className="h-7 w-7 text-brand-primary" />
            <span>Trip<span className="text-brand-primary">Pilot</span></span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-medium hover:text-white transition-colors">
              Sign In
            </Link>
            <Link to="/register" className="bg-brand-primary hover:bg-brand-secondary text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-md">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-grow flex flex-col items-center justify-center text-center px-4 py-20 relative overflow-hidden">
        {/* Subtle Background Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-primary/10 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="max-w-3xl mx-auto z-10">
          <div className="inline-flex items-center gap-2 bg-brand-primary/15 border border-brand-primary/30 rounded-full px-4 py-1.5 text-brand-primary text-xs font-semibold uppercase tracking-wider mb-6 animate-bounce">
            <Sparkles className="h-3.5 w-3.5" />
            Empowered by AI Generation
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white leading-tight mb-6">
            Plan Your Perfect Trip <br />
            <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
              With AI Co-Pilot
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Generate custom day-wise itineraries matching your destination, budget style, duration, and travel style template. Save, revise, and customize in seconds.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="w-full sm:w-auto bg-brand-primary hover:bg-brand-secondary text-white text-base font-semibold px-8 py-4 rounded-xl shadow-lg transition-all transform hover:scale-[1.02]"
            >
              Start Planning Free
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-white text-base font-semibold px-8 py-4 rounded-xl transition-all"
            >
              Sign In to Your Dashboard
            </Link>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 px-4 z-10">
          <div className="glass-panel p-8 rounded-2xl text-left hover:border-brand-primary/40 transition-all group">
            <div className="bg-blue-500/10 text-blue-400 rounded-xl p-3 inline-flex mb-5">
              <Sparkles className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-brand-primary transition-colors">Instant AI Generation</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Input destination details and category templates. Let our Llama3 integration outline morning, afternoon, and evening ideas instantly.
            </p>
          </div>

          <div className="glass-panel p-8 rounded-2xl text-left hover:border-brand-primary/40 transition-all group">
            <div className="bg-indigo-500/10 text-indigo-400 rounded-xl p-3 inline-flex mb-5">
              <RefreshCw className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-brand-primary transition-colors">Intelligent Revision</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Don't like an output? Refine specific items using natural text instructions like "change Day 2 lunch to seafood spot."
            </p>
          </div>

          <div className="glass-panel p-8 rounded-2xl text-left hover:border-brand-primary/40 transition-all group">
            <div className="bg-purple-500/10 text-purple-400 rounded-xl p-3 inline-flex mb-5">
              <Shield className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-brand-primary transition-colors">Request Limit Guards</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Enjoy 5 free generations daily. Upgrade to Premium for unlimited queries, custom features, and expanded trip saves.
            </p>
          </div>
        </div>
      </main>

      {/* Footer Area */}
      <footer className="border-t border-dark-border/40 py-8 bg-dark-bg/60 text-center text-sm text-gray-500">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 font-semibold text-gray-400">
            <Compass className="h-4 w-4 text-brand-primary" />
            <span>TripPilot &copy; 2026</span>
          </div>
          <p>Created as a premium MERN stack architecture project.</p>
        </div>
      </footer>
    </div>
  );
};
export default LandingPage;
