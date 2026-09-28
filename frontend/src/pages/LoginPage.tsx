import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signIn, signInAsDemo } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    try {
      const res = await signIn(email, password);
      if (res.error) {
        setErrorMsg(res.error.message || 'Login failed. Check your credentials.');
      } else {
        // Redirect based on email
        if (email.includes('officer')) navigate('/officer');
        else if (email.includes('admin')) navigate('/admin');
        else navigate('/owner');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickDemo = (role: 'OWNER' | 'OFFICER' | 'ADMIN') => {
    signInAsDemo(role);
    if (role === 'OFFICER') navigate('/officer');
    else if (role === 'ADMIN') navigate('/admin');
    else navigate('/owner');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Tricolor Accent Stripe */}
      <div className="fixed top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#FF9933] via-white via-50% to-[#138808] shadow-sm" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-sovereign-navy text-white text-2xl font-bold shadow-lg border-2 border-sovereign-brass mb-3">
          मान
        </div>
        <h2 className="text-3xl font-extrabold text-sovereign-navy tracking-tight">
          e-MAANAK Portal
        </h2>
        <p className="mt-1 text-sm text-slate-600 font-medium">
          Sovereign Legal Metrology Verification System (SIH 2026)
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl px-4 sm:px-0">
        <div className="bg-white py-8 px-6 shadow-xl rounded-xl sm:px-10 border border-slate-200">
          {errorMsg && (
            <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700 flex items-start">
              <span className="mr-2 font-bold">⚠️</span>
              <div>{errorMsg}</div>
            </div>
          )}

          {/* Quick Demo Access Bar */}
          <div className="mb-8 p-4 bg-amber-50/80 border border-amber-200 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-900">
                ⚡ SIH Demo Quick Login (One-Click)
              </span>
              <span className="text-[10px] bg-amber-200/70 text-amber-900 px-2 py-0.5 rounded font-mono font-semibold">
                Evaluator Mode
              </span>
            </div>
            <p className="text-xs text-amber-800 mb-3">
              Click a profile below to log in instantly without entering credentials:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('OWNER')}
                className="flex flex-col items-center justify-center p-3 bg-white border border-amber-300 rounded-lg shadow-sm hover:border-amber-500 hover:shadow-md transition text-center group"
              >
                <span className="text-xl mb-1">🏢</span>
                <span className="text-xs font-bold text-slate-800 group-hover:text-amber-800">
                  Instrument Owner
                </span>
                <span className="text-[10px] text-slate-500">Agro Logistics Ltd</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('OFFICER')}
                className="flex flex-col items-center justify-center p-3 bg-white border border-blue-300 rounded-lg shadow-sm hover:border-blue-500 hover:shadow-md transition text-center group"
              >
                <span className="text-xl mb-1">👮</span>
                <span className="text-xs font-bold text-slate-800 group-hover:text-blue-800">
                  Field Officer
                </span>
                <span className="text-[10px] text-slate-500">Insp. Rajesh Kumar</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('ADMIN')}
                className="flex flex-col items-center justify-center p-3 bg-white border border-emerald-300 rounded-lg shadow-sm hover:border-emerald-500 hover:shadow-md transition text-center group"
              >
                <span className="text-xl mb-1">🛡️</span>
                <span className="text-xs font-bold text-slate-800 group-hover:text-emerald-800">
                  Administrator
                </span>
                <span className="text-[10px] text-slate-500">Legal Metrology</span>
              </button>
            </div>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 text-slate-500 font-semibold">
                Or Sign In with Credentials
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Official Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="owner@emaanak.demo"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-sovereign-navy focus:border-sovereign-navy outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-sovereign-navy focus:border-sovereign-navy outline-none transition"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-3 px-4 bg-sovereign-navy hover:bg-blue-900 text-white font-semibold text-sm rounded-lg shadow-md hover:shadow-lg transition disabled:opacity-50"
            >
              {isSubmitting ? 'Authenticating...' : 'Sign In to Portal'}
            </button>
          </form>

          {/* Citizen QR Portal Link */}
          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500 mb-2">
              Citizen or Consumer looking to verify a weighing/measuring instrument?
            </p>
            <Link
              to="/verify/demo-qr-token-1"
              className="inline-flex items-center text-xs font-bold text-sovereign-brass hover:text-amber-700 hover:underline"
            >
              <span>Scan or View Public Verification Certificate</span>
              <span className="ml-1">→</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
