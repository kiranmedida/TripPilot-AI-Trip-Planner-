import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import Navbar from '../components/Navbar';
import { Compass, Sparkles, MapPin, Calendar, DollarSign, Plus, ArrowLeft, Check, AlertTriangle, Eye, ListChecks, HelpCircle } from 'lucide-react';

export const CreateTrip = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [generatedItinerary, setGeneratedItinerary] = useState(null);
  const [configuredData, setConfiguredData] = useState(null);
  const [saving, setSaving] = useState(false);

  const [styleType, setStyleType] = useState('Relaxed');

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      days: 3,
      budget: 'Medium',
      tripTemplate: 'Beach Vacation',
      travelStyle: 'Relaxed',
    },
  });

  const onSubmit = async (data) => {
    setError(null);
    setLoading(true);
    try {
      const res = await api.post('/ai/generate', data);
      if (res.data.success) {
        setGeneratedItinerary(res.data.data.itinerary);
        setConfiguredData(data);
        refreshUser();
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error?.message || 'Itinerary generation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!generatedItinerary || !configuredData) return;
    setSaving(true);
    setError(null);
    try {
      const res = await api.post('/trips', {
        title: generatedItinerary.title,
        destination: generatedItinerary.destination,
        budget: generatedItinerary.estimatedBudget || configuredData.budget || 'Medium',
        days: generatedItinerary.itinerary.length,
        travelStyle: configuredData.travelStyle || 'Relaxed',
        tripTemplate: configuredData.tripTemplate || 'Beach Vacation',
        itinerary: generatedItinerary.itinerary,
        packingList: generatedItinerary.packingList || [],
        travelTips: generatedItinerary.travelTips || [],
      });
      if (res.data.success) {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error?.message || 'Failed to save itinerary.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-200">
      <Navbar />

      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Navigation back */}
        <button
          onClick={() => {
            if (generatedItinerary) {
              setGeneratedItinerary(null);
            } else {
              navigate('/dashboard');
            }
          }}
          className="flex items-center gap-1 text-sm text-gray-400 hover:text-white mb-6 transition-all cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to {generatedItinerary ? 'Configuration' : 'Dashboard'}
        </button>

        {error && (
          <div className="mb-6 flex items-start gap-2 bg-red-500/15 border border-red-500/30 text-red-400 p-4 rounded-xl text-sm">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          /* Large custom loading panel */
          <div className="glass-panel p-16 rounded-3xl text-center flex flex-col items-center justify-center min-h-[450px]">
            <Compass className="h-20 w-20 text-brand-primary animate-spin mb-6" style={{ animationDuration: '3s' }} />
            <h2 className="text-2xl font-bold text-white mb-2">Generating Itinerary</h2>
            <p className="text-gray-400 text-sm max-w-sm">
              Our AI travel guides are drafting morning, afternoon, and evening ideas tailored to your specifications.
            </p>
          </div>
        ) : !generatedItinerary ? (
          /* Configuration Form */
          <div className="glass-panel p-8 rounded-3xl">
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="h-6 w-6 text-brand-primary" />
              <h2 className="text-2xl font-bold text-white">Configure AI Generation</h2>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Destination */}
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Destination</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                    <MapPin className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    placeholder="Paris, France or Tokyo, Japan"
                    className={`w-full bg-[#0d1627] border rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-brand-primary transition-all text-sm ${
                      errors.destination ? 'border-red-500/60' : 'border-dark-border'
                    }`}
                    {...register('destination', {
                      required: 'Destination is required',
                      minLength: { value: 2, message: 'Destination must be at least 2 characters long' },
                    })}
                  />
                </div>
                {errors.destination && (
                  <span className="text-xs text-red-400 mt-1 block">{errors.destination.message}</span>
                )}
              </div>

              {/* Duration (Days) */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Duration (Days)</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                    <Calendar className="h-4 w-4" />
                  </span>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    placeholder="5"
                    className={`w-full bg-[#0d1627] border rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-brand-primary transition-all text-sm ${
                      errors.days ? 'border-red-500/60' : 'border-dark-border'
                    }`}
                    {...register('days', {
                      required: 'Duration is required',
                      valueAsNumber: true,
                      min: { value: 1, message: 'Minimum trip duration is 1 day' },
                      max: { value: 30, message: 'Maximum trip duration is 30 days' },
                    })}
                  />
                </div>
                {errors.days && (
                  <span className="text-xs text-red-400 mt-1 block">{errors.days.message}</span>
                )}
              </div>

              {/* Budget Category */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Budget Style</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                    <DollarSign className="h-4 w-4" />
                  </span>
                  <select
                    className="w-full bg-[#0d1627] border border-dark-border rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-brand-primary transition-all text-sm cursor-pointer"
                    {...register('budget')}
                  >
                    <option value="Low">Low Budget</option>
                    <option value="Medium">Medium / Standard</option>
                    <option value="Luxury">Luxury / Premium</option>
                  </select>
                </div>
              </div>

              {/* Travel Style Selection */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Travel Style</label>
                <select
                  className="w-full bg-[#0d1627] border border-dark-border rounded-xl py-3 px-4 text-white focus:outline-none focus:border-brand-primary transition-all text-sm cursor-pointer mb-3"
                  value={styleType}
                  onChange={(e) => {
                    setStyleType(e.target.value);
                    if (e.target.value !== 'Custom') {
                      setValue('travelStyle', e.target.value);
                    } else {
                      setValue('travelStyle', '');
                    }
                  }}
                >
                  <option value="Relaxed">Relaxed</option>
                  <option value="Adventure">Adventure</option>
                  <option value="Luxury">Luxury</option>
                  <option value="Budget">Budget</option>
                  <option value="Business">Business</option>
                  <option value="Family">Family</option>
                  <option value="Custom">Custom / Other</option>
                </select>

                {styleType === 'Custom' ? (
                  <input
                    type="text"
                    placeholder="Enter custom travel style (e.g. Solo Backpacking)"
                    className={`w-full bg-[#0d1627] border rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-brand-primary transition-all text-sm ${
                      errors.travelStyle ? 'border-red-500/60' : 'border-dark-border'
                    }`}
                    {...register('travelStyle', {
                      required: 'Custom travel style is required when selecting Custom / Other',
                    })}
                  />
                ) : (
                  // Hidden input to register the field with default values when not using Custom
                  <input type="hidden" {...register('travelStyle')} />
                )}
                {errors.travelStyle && (
                  <span className="text-xs text-red-400 mt-1 block">{errors.travelStyle.message}</span>
                )}
              </div>

              {/* Trip Category Template */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Trip Category Template</label>
                <select
                  className="w-full bg-[#0d1627] border border-dark-border rounded-xl py-3 px-4 text-white focus:outline-none focus:border-brand-primary transition-all text-sm cursor-pointer"
                  {...register('tripTemplate')}
                >
                  <option value="Beach Vacation">Beach Vacation</option>
                  <option value="Adventure Trip">Adventure Trip</option>
                  <option value="Family Vacation">Family Vacation</option>
                  <option value="Food Exploration">Food Exploration</option>
                  <option value="Business Travel">Business Travel</option>
                  <option value="Backpacking">Backpacking</option>
                </select>
              </div>

              {/* Submit Action */}
              <div className="md:col-span-2 mt-4">
                <button
                  type="submit"
                  className="w-full bg-brand-primary hover:bg-brand-secondary text-white py-4 rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="h-5 w-5" />
                  Generate Itinerary
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* Itinerary Preview Panel */
          <div className="space-y-8">
            {/* Header Alert bar */}
            <div className="glass-panel p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 border-l-4 border-l-brand-primary">
              <div>
                <h3 className="text-lg font-bold text-white">Itinerary Drafted!</h3>
                <p className="text-gray-400 text-sm">Save this itinerary to persist it to your dashboard.</p>
              </div>
              <div className="flex gap-3 w-full sm:w-auto">
                <button
                  onClick={() => setGeneratedItinerary(null)}
                  className="flex-1 sm:flex-none bg-slate-800 hover:bg-slate-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-all cursor-pointer"
                >
                  Discard
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-grow sm:flex-none bg-brand-primary hover:bg-brand-secondary text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-70"
                >
                  <Check className="h-4 w-4" />
                  {saving ? 'Saving...' : 'Save Trip'}
                </button>
              </div>
            </div>

            {/* Generated Content Presentation */}
            <div className="glass-panel p-8 rounded-3xl space-y-8">
              <div>
                <h1 className="text-3xl font-extrabold text-white mb-2">{generatedItinerary.title}</h1>
                <p className="text-gray-400 text-sm">Destination: <span className="text-white font-medium">{generatedItinerary.destination}</span> | Budget: <span className="text-white font-medium">{generatedItinerary.estimatedBudget}</span></p>
              </div>

              {/* Packing list & tips grids */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-dark-border/40 pt-6">
                <div>
                  <h3 className="text-md font-bold text-white flex items-center gap-1.5 mb-3">
                    <ListChecks className="h-5 w-5 text-brand-primary" />
                    Recommended Packing List
                  </h3>
                  <ul className="space-y-1.5 text-sm text-gray-400">
                    {generatedItinerary.packingList?.map((item, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-brand-primary"></span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-md font-bold text-white flex items-center gap-1.5 mb-3">
                    <HelpCircle className="h-5 w-5 text-indigo-400" />
                    Travel Tips
                  </h3>
                  <ul className="space-y-1.5 text-sm text-gray-400">
                    {generatedItinerary.travelTips?.map((tip, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-indigo-400"></span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Daily schedule presentation */}
              <div className="border-t border-dark-border/40 pt-6 space-y-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
                  <Calendar className="h-5 w-5 text-brand-primary" />
                  Day-by-Day Schedule
                </h3>

                <div className="space-y-6">
                  {generatedItinerary.itinerary?.map((dayPlan, idx) => (
                    <div key={idx} className="bg-slate-900/40 border border-dark-border/30 rounded-2xl p-6 space-y-4">
                      <h4 className="text-md font-extrabold text-brand-primary border-b border-dark-border/20 pb-2">
                        Day {dayPlan.day}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Morning */}
                        <div className="space-y-2">
                          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Morning</span>
                          <p className="text-sm text-white leading-relaxed">{dayPlan.morning?.activity}</p>
                          <p className="text-xs text-gray-400"><strong className="text-gray-300">Food:</strong> {dayPlan.morning?.foodRecommendation}</p>
                          <div className="flex gap-2 mt-1">
                            <span className="bg-slate-800 text-gray-400 text-[10px] px-2 py-0.5 rounded">{dayPlan.morning?.transportation}</span>
                            <span className="bg-slate-800 text-gray-400 text-[10px] px-2 py-0.5 rounded">{dayPlan.morning?.budgetEstimate}</span>
                          </div>
                        </div>

                        {/* Afternoon */}
                        <div className="space-y-2">
                          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Afternoon</span>
                          <p className="text-sm text-white leading-relaxed">{dayPlan.afternoon?.activity}</p>
                          <p className="text-xs text-gray-400"><strong className="text-gray-300">Food:</strong> {dayPlan.afternoon?.foodRecommendation}</p>
                          <div className="flex gap-2 mt-1">
                            <span className="bg-slate-800 text-gray-400 text-[10px] px-2 py-0.5 rounded">{dayPlan.afternoon?.transportation}</span>
                            <span className="bg-slate-800 text-gray-400 text-[10px] px-2 py-0.5 rounded">{dayPlan.afternoon?.budgetEstimate}</span>
                          </div>
                        </div>

                        {/* Evening */}
                        <div className="space-y-2">
                          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Evening</span>
                          <p className="text-sm text-white leading-relaxed">{dayPlan.evening?.activity}</p>
                          <p className="text-xs text-gray-400"><strong className="text-gray-300">Food:</strong> {dayPlan.evening?.foodRecommendation}</p>
                          <div className="flex gap-2 mt-1">
                            <span className="bg-slate-800 text-gray-400 text-[10px] px-2 py-0.5 rounded">{dayPlan.evening?.transportation}</span>
                            <span className="bg-slate-800 text-gray-400 text-[10px] px-2 py-0.5 rounded">{dayPlan.evening?.budgetEstimate}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default CreateTrip;
