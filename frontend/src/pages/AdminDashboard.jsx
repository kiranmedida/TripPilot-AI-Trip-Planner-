import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import Navbar from '../components/Navbar';
import { Shield, Users, Compass, Trash2, RotateCcw, AlertTriangle } from 'lucide-react';

export const AdminDashboard = () => {
  const { user } = useAuth();
  
  const [users, setUsers] = useState([]);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAdminData = async () => {
    try {
      const usersRes = await api.get('/admin/users');
      const tripsRes = await api.get('/admin/trips');
      
      if (usersRes.data.success) {
        setUsers(usersRes.data.data.users);
      }
      if (tripsRes.data.success) {
        setTrips(tripsRes.data.data.trips);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error?.message || 'Access Denied: Admin authorization required.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      const res = await api.patch(`/admin/users/${userId}/role`, { role: newRole });
      if (res.data.success) {
        setUsers((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, role: newRole, dailyLimit: newRole === 'User' ? 5 : 9999 } : u))
        );
      }
    } catch (err) {
      alert('Failed to change user role.');
    }
  };

  const handleResetLimit = async (userId) => {
    try {
      const res = await api.patch(`/admin/users/${userId}/reset-limit`);
      if (res.data.success) {
        setUsers((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, usedToday: 0 } : u))
        );
        alert('User AI request limits reset successfully.');
      }
    } catch (err) {
      alert('Failed to reset user limits.');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('WARNING: Deleting this user will permanently delete their account and ALL associated trips. Proceed?')) return;
    try {
      const res = await api.delete(`/admin/users/${userId}`);
      if (res.data.success) {
        setUsers((prev) => prev.filter((u) => u._id !== userId));
        setTrips((prev) => prev.filter((t) => t.userId?._id !== userId));
      }
    } catch (err) {
      alert('Failed to delete user.');
    }
  };

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

  if (error) {
    return (
      <div className="min-h-screen bg-[#0b0f19] text-gray-200">
        <Navbar />
        <div className="max-w-xl mx-auto px-6 py-20 text-center">
          <AlertTriangle className="h-14 w-14 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-gray-400 mb-6">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-200">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-10 space-y-12">
        {/* Page title */}
        <div className="flex items-center gap-2.5">
          <Shield className="h-8 w-8 text-yellow-500" />
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Admin Control Panel</h1>
            <p className="text-gray-400 text-sm">Moderate system users, quotas, roles, and saved itineraries</p>
          </div>
        </div>

        {/* Users Table */}
        <div className="glass-panel rounded-2xl overflow-hidden">
          <div className="px-6 py-5 bg-slate-900/30 border-b border-dark-border/40 flex items-center gap-2">
            <Users className="h-5 w-5 text-brand-primary" />
            <h2 className="text-lg font-bold text-white">Registered Users</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-dark-border/20 text-xs font-semibold text-gray-400 uppercase tracking-wider bg-slate-900/10">
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Quota (Used Today)</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-border/10 text-sm">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-900/10 transition-colors">
                    <td className="px-6 py-4 font-semibold text-white">{u.name}</td>
                    <td className="px-6 py-4 text-gray-400">{u.email}</td>
                    <td className="px-6 py-4">
                      <select
                        className="bg-[#0d1627] border border-dark-border rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-brand-primary cursor-pointer font-semibold"
                        value={u.role}
                        onChange={(e) => handleRoleChange(u._id, e.target.value)}
                      >
                        <option value="User">User</option>
                        <option value="Premium">Premium</option>
                        <option value="Admin">Admin</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-gray-400">
                      {u.role === 'User' ? `${u.usedToday} / ${u.dailyLimit}` : `${u.usedToday} (Unlimited)`}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleResetLimit(u._id)}
                          className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-all cursor-pointer"
                          title="Reset Quota Limit"
                        >
                          <RotateCcw className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u._id)}
                          className="text-gray-400 hover:text-red-400 p-2 rounded-lg hover:bg-red-500/10 transition-all cursor-pointer"
                          title="Delete User Account"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* System-wide Saved Trips */}
        <div className="glass-panel rounded-2xl overflow-hidden">
          <div className="px-6 py-5 bg-slate-900/30 border-b border-dark-border/40 flex items-center gap-2">
            <Compass className="h-5 w-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-white">System Trip Catalog</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-dark-border/20 text-xs font-semibold text-gray-400 uppercase tracking-wider bg-slate-900/10">
                  <th className="px-6 py-4">Trip Title</th>
                  <th className="px-6 py-4">Destination</th>
                  <th className="px-6 py-4">Template</th>
                  <th className="px-6 py-4">Owned By</th>
                  <th className="px-6 py-4">Created Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-border/10 text-sm">
                {trips.map((t) => (
                  <tr key={t._id} className="hover:bg-slate-900/10 transition-colors">
                    <td className="px-6 py-4 font-semibold text-white">{t.title}</td>
                    <td className="px-6 py-4 text-gray-400">{t.destination}</td>
                    <td className="px-6 py-4">
                      <span className="text-xs bg-slate-800 text-gray-400 px-2.5 py-0.5 rounded-full">
                        {t.tripTemplate}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-400">
                      {t.userId?.name || <span className="italic text-gray-500">Deleted User</span>} 
                      <span className="block text-xs text-gray-500">{t.userId?.email || 'N/A'}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(t.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
export default AdminDashboard;
