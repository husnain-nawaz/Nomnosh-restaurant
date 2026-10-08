import React, { useState } from 'react';
import { X, Mail, Lock, User, Phone, MapPin, ArrowRight, ShieldCheck, Sparkles, Loader2 } from 'lucide-react';

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  if (!isOpen) return null;

  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Quick Demo Logins
  const handleQuickDemo = (type) => {
    if (type === 'admin') {
      setEmail('admin@nomnoshpizza.com');
      setPassword('admin123');
    } else {
      setEmail('sale@meezu.pk');
      setPassword('password123');
    }
  };

  // Google Login Simulation & Direct GIS Payload
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      // In production or web client, GIS returns Google credential token or user profile
      const googleUser = {
        email: email && email.includes('@') ? email : 'customer.google@nomnoshpizza.com',
        name: name ? name : 'Google Gourmet',
        sub: 'google_oauth_' + Math.floor(100000 + Math.random() * 900000),
        picture: 'https://api.dicebear.com/7.x/avataaars/svg?seed=GoogleUser'
      };

      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(googleUser)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Google login failed');

      localStorage.setItem('nomnosh_token', data.token);
      onAuthSuccess(data.user);
      onClose();
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
    const payload = mode === 'login'
      ? { email, password }
      : { name, email, password, phone, address };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Authentication failed');

      localStorage.setItem('nomnosh_token', data.token);
      onAuthSuccess(data.user);
      onClose();
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-stone-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-amber-600 to-orange-600 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-black/20 hover:bg-black/30 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">🍕</span>
            <span className="font-black text-xl tracking-tight uppercase font-['Syne',sans-serif]">
              NOM <span className="text-amber-200">NOSH</span>
            </span>
          </div>

          <h2 className="text-xl font-bold font-['Syne',sans-serif]">
            {mode === 'login' ? 'Welcome Back!' : 'Join NOM NOSH Rewards'}
          </h2>
          <p className="text-xs text-amber-100 mt-0.5">
            {mode === 'login'
              ? 'Sign in to track hot orders & access saved delivery addresses.'
              : 'Create your account for fast checkout and exclusive midnight deals.'}
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-stone-200 bg-stone-50">
          <button
            onClick={() => { setMode('login'); setErrorMessage(''); }}
            className={`flex-1 py-3 text-xs font-bold text-center transition-all ${
              mode === 'login'
                ? 'bg-white text-stone-900 border-b-2 border-amber-600'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            Sign In (JWT)
          </button>
          <button
            onClick={() => { setMode('register'); setErrorMessage(''); }}
            className={`flex-1 py-3 text-xs font-bold text-center transition-all ${
              mode === 'register'
                ? 'bg-white text-stone-900 border-b-2 border-amber-600'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            Create Account
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Google Sign In Button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full py-2.5 px-4 rounded-xl border border-stone-300 hover:border-stone-400 bg-white hover:bg-stone-50 text-stone-800 text-xs font-bold flex items-center justify-center gap-3 shadow-2xs active:scale-95 transition-all"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-stone-200" />
            <span className="text-[11px] font-medium text-stone-400 uppercase tracking-wider">or email</span>
            <div className="flex-1 h-px bg-stone-200" />
          </div>

          {/* Quick Demo Credentials shortcut */}
          <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200/80 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-bold text-amber-900">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                Quick Test Credentials:
              </span>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('admin')}
                className="flex-1 py-1.5 px-2 bg-stone-900 hover:bg-stone-800 text-amber-400 rounded-lg text-[10px] font-bold tracking-tight transition-colors"
              >
                Admin (Store Manager)
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('customer')}
                className="flex-1 py-1.5 px-2 bg-amber-200 hover:bg-amber-300 text-amber-950 rounded-lg text-[10px] font-bold tracking-tight transition-colors"
              >
                Customer (Sale Meezu)
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === 'register' && (
              <div>
                <label className="text-[11px] font-semibold text-stone-700 block mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Sale Meezu"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-300 focus:border-amber-500 text-xs text-stone-900 outline-hidden"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-[11px] font-semibold text-stone-700 block mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="sale@meezu.pk"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-300 focus:border-amber-500 text-xs text-stone-900 outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-stone-700 block mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-300 focus:border-amber-500 text-xs text-stone-900 outline-hidden font-mono"
                />
              </div>
            </div>

            {mode === 'register' && (
              <>
                <div>
                  <label className="text-[11px] font-semibold text-stone-700 block mb-1">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+92 300 1234567"
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-300 focus:border-amber-500 text-xs text-stone-900 outline-hidden font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-stone-700 block mb-1">
                    Delivery Address
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                    <textarea
                      rows={2}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Sahiwal Colony, Sahiwal"
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-300 focus:border-amber-500 text-xs text-stone-900 outline-hidden resize-none"
                    />
                  </div>
                </div>
              </>
            )}

            {errorMessage && (
              <p className="text-xs text-rose-600 bg-rose-50 p-2.5 rounded-xl border border-rose-200">
                {errorMessage}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md shadow-amber-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>{mode === 'login' ? 'Sign In' : 'Create My Account'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
