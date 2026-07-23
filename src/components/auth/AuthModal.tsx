import React, { useState } from 'react';
import { X, Lock, Mail, User, ShieldCheck, KeyRound } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/auth.service';

export const AuthModal: React.FC = () => {
  const { isModalOpen, closeAuthModal, signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (mode === 'signin') {
        await signIn(email, password);
      } else if (mode === 'signup') {
        await signUp(email, password, fullName);
      } else if (mode === 'forgot') {
        await authService.resetPassword(email);
        setSuccessMsg('Password reset email sent! Check your inbox.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
      <div className="bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-[#2d2d2d] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative">
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {mode === 'signin' && 'Sign In to Milestone'}
                {mode === 'signup' && 'Create Enterprise Account'}
                {mode === 'forgot' && 'Reset Password'}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Supabase Authentication System
              </p>
            </div>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 text-red-600 dark:text-red-400 text-xs rounded-lg">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/40 text-green-600 dark:text-green-400 text-xs rounded-lg">
              {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-gray-50 dark:bg-[#151515] border border-gray-200 dark:border-[#2d2d2d] rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-primary-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@fleetcorp.com"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-gray-50 dark:bg-[#151515] border border-gray-200 dark:border-[#2d2d2d] rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-primary-500"
                />
              </div>
            </div>

            {mode !== 'forgot' && (
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-gray-50 dark:bg-[#151515] border border-gray-200 dark:border-[#2d2d2d] rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-primary-500"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-primary-600 hover:bg-primary-700 text-white font-semibold text-xs rounded-lg transition-colors shadow-sm disabled:opacity-50"
            >
              {loading ? 'Processing...' : mode === 'signin' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Send Reset Link'}
            </button>
          </form>

          <div className="mt-5 pt-4 border-t border-gray-100 dark:border-[#2d2d2d] flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
            {mode === 'signin' ? (
              <>
                <button onClick={() => setMode('forgot')} className="hover:underline flex items-center gap-1">
                  <KeyRound className="w-3 h-3" /> Forgot Password?
                </button>
                <button onClick={() => setMode('signup')} className="font-semibold text-primary-600 dark:text-primary-400 hover:underline">
                  Create Account
                </button>
              </>
            ) : (
              <button onClick={() => setMode('signin')} className="font-semibold text-primary-600 dark:text-primary-400 hover:underline">
                Back to Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
