import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import Navbar from '../components/Navbar';
import {
  Compass,
  Sparkles,
  MapPin,
  Calendar,
  DollarSign,
  Trash2,
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Send,
  Loader2,
  AlertCircle,
  Edit2,
  Trophy,
  Coffee,
  Sun,
  Moon,
  Check,
  Plus,
  MessageSquare,
  BadgeAlert,
  Wallet,
  Settings,
  Notebook,
  CloudSun,
  X
} from 'lucide-react';

export const TripDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();

  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Layout tabs
  const [activeTab, setActiveTab] = useState('copilot');

  // Expanded days state
  const [expandedDays, setExpandedDays] = useState({ 0: true });

  // Co-Pilot adjustment console states
  const [instruction, setInstruction] = useState('');
  const [regenerating, setRegenerating] = useState(false);

  // Editing trip title states
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  // Gamification states
  const [showLevelUpModal, setShowLevelUpModal] = useState(false);
  const [newLevelReached, setNewLevelReached] = useState(1);
  const [activeXpPop, setActiveXpPop] = useState(null); // holds activityId

  // --- SaaS Utility States ---
  // Chat
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [sendingChat, setSendingChat] = useState(false);
  const chatEndRef = useRef(null);

  // Expenses
  const [expenses, setExpenses] = useState([]);
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseCategory, setExpenseCategory] = useState('Food');
  const [expenseDescription, setExpenseDescription] = useState('');
  const [analyzingBudget, setAnalyzingBudget] = useState(false);
  const [budgedAdviceText, setBudgetAdviceText] = useState('');

  // Weather & Route Optimization
  const [optimizingRoute, setOptimizingRoute] = useState(false);
  const [selectedWeatherDayId, setSelectedWeatherDayId] = useState('');
  const [weatherCondition, setWeatherCondition] = useState('Sunny');
  const [weatherTemp, setWeatherTemp] = useState('75°F');

  // Notes
  const [notes, setNotes] = useState([]);
  const [noteContent, setNoteContent] = useState('');
  const [noteCategory, setNoteCategory] = useState('General');

  const fetchTrip = async () => {
    try {
      const res = await api.get(`/trips/${id}`);
      if (res.data.success) {
        setTrip(res.data.data);
        setNewTitle(res.data.data.title);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error?.message || 'Could not retrieve trip details.');
    } finally {
      setLoading(false);
    }
  };

  const fetchExpenses = async () => {
    try {
      const res = await api.get(`/expenses/trip/${id}`);
      if (res.data.success) {
        setExpenses(res.data.data.expenses || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchNotes = async () => {
    try {
      const res = await api.get(`/notes/trip/${id}`);
      if (res.data.success) {
        setNotes(res.data.data.notes || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchChatHistory = async () => {
    try {
      const res = await api.get(`/ai/chat/${id}`);
      if (res.data.success) {
        setChatMessages(res.data.data.history || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTrip();
    fetchExpenses();
    fetchNotes();
    fetchChatHistory();
  }, [id]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, activeTab]);

  const toggleDay = (idx) => {
    setExpandedDays((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const handleUpdateTitle = async () => {
    if (!newTitle.trim()) return;
    try {
      const res = await api.put(`/trips/${id}`, { title: newTitle });
      if (res.data.success) {
        setTrip((prev) => ({ ...prev, title: newTitle }));
        setIsEditingTitle(false);
      }
    } catch (err) {
      alert('Failed to update title.');
    }
  };

  const handleTogglePackingItem = async (index) => {
    if (!trip) return;

    const updatedPackingList = [...trip.packingList];
    updatedPackingList[index].packed = !updatedPackingList[index].packed;

    setTrip((prev) => ({
      ...prev,
      packingList: updatedPackingList,
    }));

    try {
      await api.put(`/trips/${id}`, { packingList: updatedPackingList });
    } catch (err) {
      console.error('Failed to save packing list:', err);
      // Revert on failure
      updatedPackingList[index].packed = !updatedPackingList[index].packed;
      setTrip((prev) => ({
        ...prev,
        packingList: updatedPackingList,
      }));
    }
  };

  const handleToggleActivity = async (dayIndex, timeSlot, activityId) => {
    if (!activityId) return;

    try {
      const res = await api.patch(`/itinerary/activities/${activityId}/toggle`);
      if (res.data.success) {
        const { activity, leveledUp, level } = res.data.data;

        if (activity.completed) {
          setActiveXpPop(activityId);
          setTimeout(() => setActiveXpPop(null), 1500);
        }

        setTrip((prev) => {
          const updatedItinerary = [...prev.itinerary];
          const day = updatedItinerary[dayIndex];
          if (day && day[timeSlot]) {
            day[timeSlot].completed = activity.completed;
          }
          return { ...prev, itinerary: updatedItinerary };
        });

        if (leveledUp) {
          setNewLevelReached(level);
          setShowLevelUpModal(true);
        }

        refreshUser();
      }
    } catch (err) {
      console.error('Failed to toggle activity:', err);
    }
  };

  const handleRegenerate = async (e) => {
    e.preventDefault();
    if (!instruction.trim()) return;

    setRegenerating(true);
    try {
      const res = await api.post('/ai/regenerate', {
        tripId: id,
        instruction,
      });
      if (res.data.success) {
        setTrip(res.data.data);
        setInstruction('');
        alert('Itinerary updated successfully!');
      }
    } catch (err) {
      console.error(err);
      alert('AI adjustment failed.');
    } finally {
      setRegenerating(false);
    }
  };

  // --- SaaS Panel Submit Handlers ---
  const handleSendChat = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = { sender: 'User', message: chatInput, _id: Date.now().toString() };
    setChatMessages((prev) => [...prev, userMsg]);
    const promptText = chatInput;
    setChatInput('');
    setSendingChat(true);

    try {
      const res = await api.post(`/ai/chat/${id}`, { message: promptText });
      if (res.data.success) {
        setChatMessages((prev) => [...prev, { sender: 'AI', message: res.data.data.response }]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSendingChat(false);
    }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!expenseAmount) return;

    try {
      const res = await api.post(`/expenses/trip/${id}`, {
        amount: parseFloat(expenseAmount),
        category: expenseCategory,
        description: expenseDescription || `${expenseCategory} Expense`,
      });
      if (res.data.success) {
        setExpenses((prev) => [res.data.data, ...prev]);
        setExpenseAmount('');
        setExpenseDescription('');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to save expense.');
    }
  };

  const handleDeleteExpense = async (expenseId) => {
    try {
      const res = await api.delete(`/expenses/${expenseId}`);
      if (res.data.success) {
        setExpenses((prev) => prev.filter((exp) => exp._id !== expenseId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleGetBudgetAdvice = async () => {
    setAnalyzingBudget(true);
    try {
      const res = await api.post(`/ai/budget-advice/${id}`);
      if (res.data.success) {
        setBudgetAdviceText(res.data.data.advice);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAnalyzingBudget(false);
    }
  };

  const handleOptimizeRoute = async () => {
    setOptimizingRoute(true);
    try {
      const res = await api.post(`/ai/optimize-route/${id}`);
      if (res.data.success) {
        alert(res.data.data.message);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setOptimizingRoute(false);
    }
  };

  const handleUpdateWeather = async (e) => {
    e.preventDefault();
    if (!selectedWeatherDayId) return;

    try {
      const res = await api.put(`/itinerary/days/${selectedWeatherDayId}/weather`, {
        condition: weatherCondition,
        temperature: weatherTemp,
      });
      if (res.data.success) {
        alert('Weather info updated successfully!');
        fetchTrip(); // reload trip structure
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!noteContent.trim()) return;

    try {
      const res = await api.post(`/notes/trip/${id}`, {
        content: noteContent,
        category: noteCategory,
      });
      if (res.data.success) {
        setNotes((prev) => [res.data.data, ...prev]);
        setNoteContent('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteNote = async (noteId) => {
    try {
      const res = await api.delete(`/notes/${noteId}`);
      if (res.data.success) {
        setNotes((prev) => prev.filter((n) => n._id !== noteId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to permanently delete this itinerary?')) return;
    try {
      const res = await api.delete(`/trips/${id}`);
      if (res.data.success) {
        navigate('/dashboard');
      }
    } catch (err) {
      alert('Failed to delete itinerary.');
    }
  };

  const totalExpense = expenses.reduce((sum, item) => sum + item.amount, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0f19] text-gray-200">
        <Navbar />
        <div className="flex items-center justify-center py-40">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-primary border-t-transparent"></div>
        </div>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="min-h-screen bg-[#0b0f19] text-gray-200">
        <Navbar />
        <div className="max-w-3xl mx-auto px-6 py-20 text-center">
          <AlertCircle className="h-14 w-14 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Error Loading Trip</h2>
          <p className="text-gray-400 mb-6">{error || 'Trip not found.'}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-brand-primary hover:bg-brand-secondary text-white font-semibold py-2 px-6 rounded-xl transition-all cursor-pointer"
          >
            Go back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-200">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Navigation row */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-all cursor-pointer bg-slate-900/40 hover:bg-slate-900/80 px-3 py-1.5 rounded-lg border border-dark-border/20"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          <button
            onClick={handleDelete}
            className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-sm font-semibold px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Trash2 className="h-4 w-4" />
            Delete Trip
          </button>
        </div>

        {/* Outer Split Column Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: Itinerary days & timeline */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* Header cover details */}
            <div className="glass-panel p-6 rounded-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-brand-primary/5 rounded-full blur-[80px] pointer-events-none"></div>

              <div className="space-y-3">
                {isEditingTitle ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      className="bg-[#0d1627] border border-dark-border rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand-primary text-xl font-bold w-full"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                    />
                    <button
                      onClick={handleUpdateTitle}
                      className="bg-brand-primary text-white text-sm font-semibold px-4 py-2.5 rounded-xl cursor-pointer"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setIsEditingTitle(false)}
                      className="bg-slate-800 text-gray-300 text-sm font-semibold px-3 py-2.5 rounded-xl cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 group">
                    <h1 className="text-2xl font-extrabold text-white tracking-tight">{trip.title}</h1>
                    <button
                      onClick={() => setIsEditingTitle(true)}
                      className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-white p-1 transition-all cursor-pointer"
                      title="Edit Title"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-gray-400">
                  <span className="flex items-center gap-1.5 text-gray-300">
                    <MapPin className="h-4 w-4 text-brand-primary" />
                    {trip.destination}
                  </span>
                  <span className="text-gray-700">|</span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    {trip.days} Days ({trip.travelStyle})
                  </span>
                  <span className="text-gray-700">|</span>
                  <span className="flex items-center gap-1.5">
                    <DollarSign className="h-4 w-4 text-gray-500" />
                    Budget: <strong className="text-white">{trip.budget} USD</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Checklist and Tips */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Packing list */}
              <div className="glass-panel p-5 rounded-xl space-y-4">
                <div className="flex justify-between items-center border-b border-dark-border/20 pb-2">
                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <CheckCircle2 className="h-4.5 w-4.5 text-brand-primary" />
                    Packing Checklist
                  </h3>
                  <span className="text-[10px] text-gray-400">
                    {trip.packingList?.filter((i) => i.packed).length || 0} / {trip.packingList?.length || 0}
                  </span>
                </div>

                <div className="space-y-1 max-h-[160px] overflow-y-auto pr-1">
                  {trip.packingList?.map((itemObj, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleTogglePackingItem(idx)}
                      className="w-full text-left flex items-center gap-2.5 py-1.5 px-2 rounded-lg hover:bg-slate-900/30 transition-all cursor-pointer group"
                    >
                      <span className={`h-4.5 w-4.5 rounded border flex items-center justify-center transition-all ${
                        itemObj.packed
                          ? 'bg-brand-primary border-brand-primary text-white'
                          : 'border-dark-border bg-slate-900/40 group-hover:border-brand-primary'
                      }`}>
                        {itemObj.packed && <Check className="h-3 w-3 stroke-[3]" />}
                      </span>
                      <span className={`text-xs transition-all ${itemObj.packed ? 'line-through text-gray-500' : 'text-gray-300'}`}>
                        {itemObj.item}
                      </span>
                    </button>
                  ))}
                  {(!trip.packingList || trip.packingList.length === 0) && (
                    <p className="text-xs text-gray-500 italic">No packing recommendations</p>
                  )}
                </div>
              </div>

              {/* Tips */}
              <div className="glass-panel p-5 rounded-xl space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5 border-b border-dark-border/20 pb-2">
                  <Compass className="h-4.5 w-4.5 text-indigo-400" />
                  Travel Tips
                </h3>
                <ul className="space-y-2.5 max-h-[160px] overflow-y-auto pr-1">
                  {trip.travelTips?.map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-gray-400">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-400"></span>
                      <span>{tip}</span>
                    </li>
                  ))}
                  {(!trip.travelTips || trip.travelTips.length === 0) && (
                    <p className="text-xs text-gray-500 italic">No tips available</p>
                  )}
                </ul>
              </div>
            </div>

            {/* Itinerary timeline days */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-white">Interactive Timeline</h2>

              {trip.itinerary?.map((dayPlan, idx) => {
                const isExpanded = expandedDays[idx] || false;
                const slots = ['morning', 'afternoon', 'evening'];
                const completedCount = slots.reduce((acc, slot) => acc + (dayPlan[slot]?.completed ? 1 : 0), 0);

                return (
                  <div key={idx} className="glass-panel rounded-xl overflow-hidden border border-dark-border/30">
                    <button
                      onClick={() => toggleDay(idx)}
                      className="w-full flex items-center justify-between p-4 bg-slate-900/30 hover:bg-slate-900/50 transition-all text-left cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-white text-sm">
                          Day {dayPlan.day} Schedule
                        </span>
                        {dayPlan.weatherSummary?.condition && (
                          <span className="text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                            ⛅ {dayPlan.weatherSummary.condition} ({dayPlan.weatherSummary.temperature})
                          </span>
                        )}
                        {completedCount > 0 && (
                          <span className="text-[10px] bg-brand-primary/10 text-brand-primary px-2.5 py-0.5 rounded-full border border-brand-primary/20 font-medium">
                            {completedCount}/3 Completed
                          </span>
                        )}
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-gray-400" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-gray-400" />
                      )}
                    </button>

                    {isExpanded && (
                      <div className="p-5 border-t border-dark-border/20 bg-[#0c1221]/50 space-y-6 relative">
                        <div className="absolute left-8 top-8 bottom-8 w-0.5 bg-slate-800 pointer-events-none"></div>

                        {slots.map((slotKey) => {
                          const slot = dayPlan[slotKey];
                          if (!slot) return null;

                          const isCompleted = slot.completed;
                          const isPopping = activeXpPop === slot.id;

                          const slotIcons = {
                            morning: <Coffee className="h-3.5 w-3.5" />,
                            afternoon: <Sun className="h-3.5 w-3.5" />,
                            evening: <Moon className="h-3.5 w-3.5 text-indigo-400" />,
                          };

                          return (
                            <div key={slotKey} className="flex items-start gap-4 relative group">
                              <button
                                onClick={() => handleToggleActivity(idx, slotKey, slot.id)}
                                className={`z-10 h-6.5 w-6.5 rounded-full flex items-center justify-center border transition-all cursor-pointer focus:outline-none ${
                                  isCompleted
                                    ? 'bg-brand-primary border-brand-primary text-white'
                                    : 'bg-[#0b0f19] border-slate-700 text-slate-500 hover:border-brand-primary'
                                }`}
                              >
                                {isCompleted ? (
                                  <Check className="h-3.5 w-3.5 stroke-[3]" />
                                ) : (
                                  slotIcons[slotKey]
                                )}
                              </button>

                              {isPopping && (
                                <span className="absolute -left-2 -top-6 text-brand-primary font-bold text-[10px] bg-slate-900 border border-brand-primary/30 px-2 py-0.5 rounded shadow-lg animate-bounce z-20">
                                  +15 XP 🌟
                                </span>
                              )}

                              <div className="flex-grow space-y-1.5 min-w-0">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                  <span className={`text-[10px] font-semibold uppercase tracking-wider ${
                                    isCompleted ? 'text-brand-primary' : 'text-slate-400'
                                  }`}>
                                    {slotKey}
                                  </span>

                                  <button
                                    onClick={() => handleToggleActivity(idx, slotKey, slot.id)}
                                    className={`text-[10px] font-semibold px-2 py-0.5 rounded transition-all cursor-pointer ${
                                      isCompleted
                                        ? 'bg-brand-primary/10 text-brand-primary border border-brand-primary/20'
                                        : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                                    }`}
                                  >
                                    {isCompleted ? 'Completed ✓' : 'Mark Done'}
                                  </button>
                                </div>

                                <p className={`text-xs leading-relaxed transition-all ${
                                  isCompleted ? 'line-through text-gray-500' : 'text-white'
                                }`}>
                                  {slot.activity}
                                </p>

                                {slot.foodRecommendation && (
                                  <p className="text-[11px] text-gray-400">
                                    <strong className="text-gray-300">Dining Tip:</strong> {slot.foodRecommendation}
                                  </p>
                                )}

                                <div className="flex gap-2 pt-1">
                                  {slot.transportation && (
                                    <span className="bg-[#0f172a] text-slate-400 text-[9px] px-2 py-0.5 rounded border border-slate-800/60">
                                      {slot.transportation}
                                    </span>
                                  )}
                                  {slot.budgetEstimate && (
                                    <span className="bg-[#0f172a] text-slate-400 text-[9px] px-2 py-0.5 rounded border border-slate-800/60">
                                      Est: {slot.budgetEstimate}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* AI Co-Pilot adjustment */}
            <div className="glass-panel p-5 rounded-2xl space-y-3.5 border border-brand-primary/20 bg-brand-primary/5">
              <div className="flex items-center gap-1.5">
                <Sparkles className="h-4.5 w-4.5 text-brand-primary animate-spin" style={{ animationDuration: '4s' }} />
                <h3 className="text-sm font-bold text-white">Co-Pilot Adjustment Console</h3>
              </div>
              <p className="text-gray-400 text-xs leading-relaxed">
                Prompt revisions directly (e.g., "Change Day 3 evening activity to beach lounge", "Reduce the budget suggestion").
              </p>

              <form onSubmit={handleRegenerate} className="flex gap-2.5">
                <input
                  type="text"
                  disabled={regenerating}
                  placeholder="Ask Co-Pilot to adjust details..."
                  className="flex-grow bg-[#0d1627] border border-dark-border rounded-xl px-3 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-primary transition-all disabled:opacity-75"
                  value={instruction}
                  onChange={(e) => setInstruction(e.target.value)}
                />
                <button
                  type="submit"
                  disabled={regenerating || !instruction.trim()}
                  className="bg-brand-primary hover:bg-brand-secondary text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-all flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  {regenerating ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Send className="h-3.5 w-3.5" />
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* RIGHT COLUMN: SaaS panel tabs */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-[90px]">
            
            {/* Tabs Navigation Header */}
            <div className="glass-panel p-1 rounded-xl flex gap-1 border border-dark-border/40">
              {[
                { id: 'copilot', label: 'AI Copilot', icon: <MessageSquare className="h-4 w-4" /> },
                { id: 'expenses', label: 'Expenses', icon: <Wallet className="h-4 w-4" /> },
                { id: 'opt', label: 'Optimize', icon: <Settings className="h-4 w-4" /> },
                { id: 'notes', label: 'Notes', icon: <Notebook className="h-4 w-4" /> },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-brand-primary text-white shadow-md'
                      : 'text-gray-400 hover:text-white hover:bg-slate-800/40'
                  }`}
                >
                  {tab.icon}
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* TAB CONTENTS */}
            <div className="glass-panel p-5 rounded-2xl min-h-[460px] flex flex-col justify-between">
              
              {/* Tab 1: AI Copilot Chat */}
              {activeTab === 'copilot' && (
                <div className="flex flex-col h-full justify-between flex-grow">
                  <div className="space-y-1.5 border-b border-dark-border/20 pb-2 mb-3">
                    <h3 className="text-sm font-bold text-white flex items-center gap-1">
                      <Sparkles className="h-4 w-4 text-brand-primary" />
                      Travel Assistant Chat
                    </h3>
                    <p className="text-[10px] text-gray-500">Ask about restaurants, transits, or things to watch out for.</p>
                  </div>

                  {/* Messages Feed */}
                  <div className="flex-grow overflow-y-auto space-y-3.5 max-h-[300px] mb-4 pr-1 min-h-[220px]">
                    {chatMessages.length === 0 ? (
                      <div className="text-center text-xs text-gray-500 py-10">
                        💬 Start talking with your Travel Copilot! Try asking "What is the best food to eat here?"
                      </div>
                    ) : (
                      chatMessages.map((msg, index) => (
                        <div
                          key={msg._id || index}
                          className={`flex ${msg.sender === 'User' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`p-3 rounded-2xl max-w-[85%] text-xs leading-relaxed ${
                            msg.sender === 'User'
                              ? 'bg-brand-primary text-white rounded-tr-none'
                              : 'bg-slate-800/80 text-gray-200 border border-slate-700/60 rounded-tl-none'
                          }`}>
                            {msg.message}
                          </div>
                        </div>
                      ))
                    )}
                    {sendingChat && (
                      <div className="flex justify-start">
                        <div className="p-3 bg-slate-800/80 border border-slate-700/60 rounded-2xl rounded-tl-none flex items-center gap-2 text-xs text-gray-400">
                          <Loader2 className="h-3 w-3 animate-spin text-brand-primary" />
                          <span>Copilot is writing...</span>
                        </div>
                      </div>
                    )}
                    <div ref={chatEndRef}></div>
                  </div>

                  {/* Input form */}
                  <form onSubmit={handleSendChat} className="flex gap-2 border-t border-dark-border/20 pt-3">
                    <input
                      type="text"
                      placeholder="Ask Copilot a question..."
                      className="flex-grow bg-[#0d1627] border border-dark-border rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-primary"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                    />
                    <button
                      type="submit"
                      disabled={sendingChat || !chatInput.trim()}
                      className="bg-brand-primary hover:bg-brand-secondary text-white font-bold p-2.5 rounded-xl cursor-pointer disabled:opacity-50 shrink-0"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </form>
                </div>
              )}

              {/* Tab 2: Expense split list */}
              {activeTab === 'expenses' && (
                <div className="flex flex-col justify-between flex-grow space-y-4">
                  <div className="space-y-2.5">
                    <div className="flex justify-between items-center border-b border-dark-border/20 pb-2">
                      <div>
                        <h3 className="text-sm font-bold text-white">Trip Expenses</h3>
                        <p className="text-[10px] text-gray-500">Track and split travel payments</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-gray-400">Total Spent</span>
                        <h4 className="text-base font-black text-brand-primary">{totalExpense} USD</h4>
                      </div>
                    </div>

                    {/* AI Budget Advice Trigger */}
                    <div className="bg-[#10192e] border border-brand-primary/20 rounded-xl p-3.5 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white flex items-center gap-1">
                          <Sparkles className="h-3.5 w-3.5 text-brand-primary" />
                          AI Budget Optimizer
                        </span>
                        <button
                          onClick={handleGetBudgetAdvice}
                          disabled={analyzingBudget}
                          className="bg-brand-primary/20 hover:bg-brand-primary hover:text-white border border-brand-primary/30 text-[10px] font-bold px-2 py-1 rounded transition-all cursor-pointer"
                        >
                          {analyzingBudget ? 'Analyzing...' : 'Get AI Advice'}
                        </button>
                      </div>

                      {budgedAdviceText && (
                        <div className="text-[11px] text-gray-300 leading-relaxed bg-[#0c1221] p-2.5 rounded border border-dark-border/40 max-h-[110px] overflow-y-auto italic">
                          {budgedAdviceText}
                        </div>
                      )}
                    </div>

                    {/* Add Expense Form */}
                    <form onSubmit={handleAddExpense} className="grid grid-cols-2 gap-2 pb-2">
                      <input
                        type="number"
                        placeholder="Amount (USD)"
                        required
                        className="bg-[#0d1627] border border-dark-border rounded-lg p-2 text-xs text-white focus:outline-none"
                        value={expenseAmount}
                        onChange={(e) => setExpenseAmount(e.target.value)}
                      />
                      <select
                        className="bg-[#0d1627] border border-dark-border rounded-lg p-2 text-xs text-white focus:outline-none"
                        value={expenseCategory}
                        onChange={(e) => setExpenseCategory(e.target.value)}
                      >
                        {['Hotel', 'Food', 'Transportation', 'Shopping', 'Entertainment', 'Others'].map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                      <input
                        type="text"
                        placeholder="Description..."
                        className="col-span-2 bg-[#0d1627] border border-dark-border rounded-lg p-2 text-xs text-white focus:outline-none"
                        value={expenseDescription}
                        onChange={(e) => setExpenseDescription(e.target.value)}
                      />
                      <button
                        type="submit"
                        className="col-span-2 bg-brand-primary hover:bg-brand-secondary text-white font-bold py-2 rounded-lg text-xs cursor-pointer flex items-center justify-center gap-1"
                      >
                        <Plus className="h-3.5 w-3.5" /> Save Expense
                      </button>
                    </form>
                  </div>

                  {/* Expenses List */}
                  <div className="overflow-y-auto space-y-2 max-h-[160px] pr-1">
                    {expenses.length === 0 ? (
                      <p className="text-center text-xs text-gray-500 py-6">No expenses recorded yet.</p>
                    ) : (
                      expenses.map((exp) => (
                        <div key={exp._id} className="bg-slate-900/40 p-2.5 rounded-lg border border-dark-border/20 flex items-center justify-between text-xs">
                          <div>
                            <span className="text-[10px] font-semibold text-gray-400 uppercase">{exp.category}</span>
                            <h5 className="font-bold text-white">{exp.description}</h5>
                            <span className="text-[9px] text-gray-500">Paid by {exp.userId?.name || 'You'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white">{exp.amount} USD</span>
                            <button
                              onClick={() => handleDeleteExpense(exp._id)}
                              className="text-gray-500 hover:text-red-400 p-1 rounded transition-colors"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Tab 3: Route Optimizer & Weather */}
              {activeTab === 'opt' && (
                <div className="flex flex-col justify-between flex-grow space-y-4">
                  <div className="space-y-4">
                    <div className="border-b border-dark-border/20 pb-2">
                      <h3 className="text-sm font-bold text-white">Route Optimizer & Weather</h3>
                      <p className="text-[10px] text-gray-500">Heuristics-based chronological organizer</p>
                    </div>

                    {/* Route optimization */}
                    <div className="bg-[#10192e] border border-brand-primary/20 rounded-xl p-4 text-center space-y-3">
                      <Compass className="h-10 w-10 text-brand-primary mx-auto animate-pulse" />
                      <div>
                        <h4 className="text-xs font-bold text-white">Optimize Day Activities Order</h4>
                        <p className="text-[10px] text-gray-400 mt-1">Re-orders activities to match location proximity guides.</p>
                      </div>
                      <button
                        onClick={handleOptimizeRoute}
                        disabled={optimizingRoute}
                        className="w-full bg-brand-primary hover:bg-brand-secondary text-white font-bold py-2 px-4 rounded-lg text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        {optimizingRoute ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <>
                            <Sparkles className="h-3.5 w-3.5" /> Optimize Chronology
                          </>
                        )}
                      </button>
                    </div>

                    {/* Weather Update forms */}
                    <form onSubmit={handleUpdateWeather} className="space-y-2.5 pt-2 border-t border-dark-border/20">
                      <h4 className="text-xs font-bold text-white flex items-center gap-1">
                        <CloudSun className="h-4 w-4 text-indigo-400" />
                        Log Day Weather Info
                      </h4>

                      <select
                        required
                        className="w-full bg-[#0d1627] border border-dark-border rounded-lg p-2 text-xs text-white focus:outline-none"
                        value={selectedWeatherDayId}
                        onChange={(e) => setSelectedWeatherDayId(e.target.value)}
                      >
                        <option value="">Select Trip Day...</option>
                        {trip.itinerary?.map((day, idx) => (
                          <option key={day.id || idx} value={day.id}>Day {day.day}</option>
                        ))}
                      </select>

                      <div className="grid grid-cols-2 gap-2">
                        <select
                          className="bg-[#0d1627] border border-dark-border rounded-lg p-2 text-xs text-white focus:outline-none"
                          value={weatherCondition}
                          onChange={(e) => setWeatherCondition(e.target.value)}
                        >
                          {['Sunny', 'Rainy', 'Cloudy', 'Snowy', 'Windy'].map((cond) => (
                            <option key={cond} value={cond}>{cond}</option>
                          ))}
                        </select>

                        <input
                          type="text"
                          placeholder="e.g. 72°F"
                          className="bg-[#0d1627] border border-dark-border rounded-lg p-2 text-xs text-white focus:outline-none"
                          value={weatherTemp}
                          onChange={(e) => setWeatherTemp(e.target.value)}
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-lg text-xs cursor-pointer"
                      >
                        Update Weather
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* Tab 4: Collaborative Notes */}
              {activeTab === 'notes' && (
                <div className="flex flex-col justify-between flex-grow space-y-4">
                  <div className="space-y-3.5">
                    <div className="border-b border-dark-border/20 pb-2">
                      <h3 className="text-sm font-bold text-white">Trip Notes</h3>
                      <p className="text-[10px] text-gray-500">Record general reminders, locations, or points</p>
                    </div>

                    {/* Add note form */}
                    <form onSubmit={handleAddNote} className="space-y-2">
                      <textarea
                        required
                        placeholder="Write note details..."
                        className="w-full h-16 bg-[#0d1627] border border-dark-border rounded-lg p-2.5 text-xs text-white focus:outline-none placeholder-gray-500"
                        value={noteContent}
                        onChange={(e) => setNoteContent(e.target.value)}
                      />

                      <div className="flex justify-between items-center">
                        <select
                          className="bg-[#0d1627] border border-dark-border rounded-lg p-1.5 text-[10px] text-white focus:outline-none"
                          value={noteCategory}
                          onChange={(e) => setNoteCategory(e.target.value)}
                        >
                          {['General', 'Reminders', 'Shopping', 'Meeting Point', 'Medical'].map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>

                        <button
                          type="submit"
                          className="bg-brand-primary hover:bg-brand-secondary text-white font-bold px-3 py-1.5 rounded-lg text-xs cursor-pointer"
                        >
                          Add Note
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Notes Feed */}
                  <div className="overflow-y-auto space-y-2 max-h-[180px] pr-1">
                    {notes.length === 0 ? (
                      <p className="text-center text-xs text-gray-500 py-6">No notes added yet.</p>
                    ) : (
                      notes.map((note) => (
                        <div key={note._id} className="bg-slate-900/40 p-3 rounded-lg border border-dark-border/20 flex flex-col justify-between text-xs space-y-1.5">
                          <div className="flex justify-between items-start">
                            <span className="text-[9px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">
                              {note.category}
                            </span>
                            <button
                              onClick={() => handleDeleteNote(note._id)}
                              className="text-gray-500 hover:text-red-400 p-0.5 transition-colors"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <p className="text-gray-300 leading-relaxed text-[11px] whitespace-pre-wrap">{note.content}</p>
                          <span className="text-[8px] text-gray-500 self-end">
                            by {note.userId?.name || 'Traveler'}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>

      {/* Gamified Level-Up Celebration Modal */}
      {showLevelUpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md transition-opacity animate-fade-in">
          <div className="relative w-full max-w-md p-8 overflow-hidden rounded-3xl border border-brand-primary/30 bg-[#0d1527] shadow-2xl text-center">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-brand-primary/20 rounded-full blur-[60px] pointer-events-none"></div>

            <div className="relative space-y-6">
              <div className="mx-auto w-20 h-20 bg-brand-primary/10 rounded-full flex items-center justify-center border border-brand-primary/20">
                <Trophy className="h-10 w-10 text-brand-primary animate-bounce" />
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-widest text-brand-primary">LEVEL UP!</span>
                <h3 className="text-2xl font-black text-white">Adventure Level Increased!</h3>
              </div>

              <p className="text-gray-300 text-sm">
                Congratulations! You reached <strong className="text-brand-primary text-lg">Level {newLevelReached}</strong> by completing trip activities. 
                Keep exploring and completing items to earn XP!
              </p>

              <button
                onClick={() => setShowLevelUpModal(false)}
                className="w-full bg-brand-primary hover:bg-brand-secondary text-white font-bold py-3.5 px-6 rounded-2xl transition-all shadow-lg shadow-brand-primary/20 cursor-pointer"
              >
                Awesome!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TripDetails;
