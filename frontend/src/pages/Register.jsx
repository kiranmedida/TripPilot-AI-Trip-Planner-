import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, AlertTriangle, Compass, Loader2 } from 'lucide-react';

export const Register = () => {
  const { register: signup } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setServerError(null);
    setSubmitting(true);
    const res = await signup(data.name, data.email, data.password);
    setSubmitting(false);

    if (res.success) {
      navigate('/dashboard');
    } else {
      setServerError(res.error);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center px-4 relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-brand-primary/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md z-10">
        {/* Branding Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-3xl font-extrabold text-white">
            <Compass className="h-8 w-8 text-brand-primary animate-spin" style={{ animationDuration: '4s' }} />
            <span>Trip<span className="text-brand-primary">Pilot</span></span>
          </Link>
          <p className="text-gray-400 mt-2 text-sm">Create an account to plan your travel itineraries</p>
        </div>

        {/* Card Panel */}
        <div className="glass-panel p-8 rounded-2xl shadow-xl">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Start Planning</h2>

          {serverError && (
            <div className="mb-5 flex items-start gap-2 bg-red-500/15 border border-red-500/30 text-red-400 p-3 rounded-lg text-sm">
              <AlertTriangle className="h-5 w-5 shrink-0" />
              <span>{serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Full Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                  <User className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  placeholder="John Doe"
                  className={`w-full bg-[#0d1627] border rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-brand-primary transition-all text-sm ${
                    errors.name ? 'border-red-500/60' : 'border-dark-border'
                  }`}
                  {...register('name', {
                    required: 'Full name is required',
                    minLength: {
                      value: 2,
                      message: 'Name must be at least 2 characters long',
                    },
                  })}
                />
              </div>
              {errors.name && (
                <span className="text-xs text-red-400 mt-1 block">{errors.name.message}</span>
              )}
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                  <Mail className="h-4 w-4" />
                </span>
                <input
                  type="email"
                  placeholder="john@example.com"
                  className={`w-full bg-[#0d1627] border rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-brand-primary transition-all text-sm ${
                    errors.email ? 'border-red-500/60' : 'border-dark-border'
                  }`}
                  {...register('email', {
                    required: 'Email address is required',
                    pattern: {
                      value: /^\S+@\S+\.\S+$/,
                      message: 'Please provide a valid email address',
                    },
                  })}
                />
              </div>
              {errors.email && (
                <span className="text-xs text-red-400 mt-1 block">{errors.email.message}</span>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  type="password"
                  placeholder="••••••••"
                  className={`w-full bg-[#0d1627] border rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-brand-primary transition-all text-sm ${
                    errors.password ? 'border-red-500/60' : 'border-dark-border'
                  }`}
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters long',
                    },
                  })}
                />
              </div>
              {errors.password && (
                <span className="text-xs text-red-400 mt-1 block">{errors.password.message}</span>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-brand-primary hover:bg-brand-secondary text-white py-3.5 rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Account Route */}
          <div className="text-center mt-6 text-sm text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-primary hover:underline font-semibold">
              Sign In here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Register;
