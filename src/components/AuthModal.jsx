import React, { useEffect, useRef, useState } from 'react';
import { X, Mail, Lock, User, Phone, MapPin, ArrowRight, Loader2 } from 'lucide-react';

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

  const googleButtonRef = useRef(null);
  const handleGoogleCredential = async (response) => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ credential: response.credential })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Google login failed');

      onAuthSuccess(data.user);
      onClose();
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen || !googleButtonRef.current) return;
    const renderGoogleButton = () => {
      if (!window.google?.accounts?.id || !googleButtonRef.current) return;
      googleButtonRef.current.innerHTML = '';
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: handleGoogleCredential,
        ux_mode: 'popup'
      });
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: 'outline', size: 'large', width: 360, text: 'continue_with', shape: 'rectangular'
      });
    };
    if (window.google?.accounts?.id) renderGoogleButton();
    else {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = renderGoogleButton;
      script.onerror = () => setErrorMessage('Unable to load Google Sign-In. Check your connection and try again.');
      document.head.appendChild(script);
    }
  }, [isOpen]);

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
          <div ref={googleButtonRef} className="min-h-10 flex justify-center" aria-label="Continue with Google" />

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-stone-200" />
            <span className="text-[11px] font-medium text-stone-400 uppercase tracking-wider">or email</span>
            <div className="flex-1 h-px bg-stone-200" />
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
                      placeholder="Enter your delivery address"
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
