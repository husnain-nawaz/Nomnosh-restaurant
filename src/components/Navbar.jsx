import React from 'react';
import { ShoppingBag, MapPin, User, LogOut, ShieldAlert, Sparkles, ChevronDown } from 'lucide-react';

export default function Navbar({
  cartCount,
  cartTotal,
  onOpenCart,
  onOpenAuth,
  onOpenLocation,
  currentUser,
  onLogout,
  viewMode,
  setViewMode,
  deliveryLocation
}) {
  return (
    <header className="sticky top-0 z-40 bg-[#FCF8F2]/95 backdrop-blur-md border-b border-amber-200/60 shadow-xs">
      {/* Top micro banner */}
      <div className="bg-amber-600 text-amber-50 px-4 py-1 text-xs text-center font-medium tracking-wide flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 animate-pulse text-amber-200" />
        <span>Midnight Nosh Offer: Valid 10:00 PM to 3:00 AM Daily · Free Regular Pizza on Selected Deals!</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => setViewMode('storefront')}
            className="flex items-center gap-2 text-left focus:outline-hidden group"
          >
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-600 to-orange-500 flex items-center justify-center shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
              <span className="text-2xl select-none">🍕</span>
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-2xl tracking-tighter text-stone-900 group-hover:text-amber-600 transition-colors uppercase font-['Syne',sans-serif]">
                NOM <span className="text-amber-600">NOSH</span>
              </span>
              <span className="text-[10px] tracking-widest uppercase font-semibold text-stone-500 -mt-1">
                Pizza & Fast Food
              </span>
            </div>
          </button>

          {/* Delivery Location pill */}
          <button
            onClick={onOpenLocation}
            className="hidden md:flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-stone-100 hover:bg-stone-200/80 text-stone-700 text-xs font-medium transition-colors border border-stone-200/70"
            title="Change Delivery Location"
          >
            <MapPin className="w-4 h-4 text-amber-600 shrink-0" />
            <div className="flex flex-col text-left">
              <span className="text-[11px] text-stone-500 leading-tight">Delivery to</span>
              <span className="font-semibold text-stone-800 leading-tight truncate max-w-[200px]">
                {deliveryLocation?.address || 'Choose a delivery location'}
              </span>
              {deliveryLocation && (
                <span className={`text-[10px] leading-tight ${deliveryLocation.deliveryAvailable === false ? 'text-rose-600' : 'text-emerald-700'}`}>
                  {deliveryLocation.deliveryAvailable === false
                    ? 'Delivery unavailable'
                    : deliveryLocation.etaMinutes
                      ? `Estimated delivery ${deliveryLocation.etaMinutes} min`
                      : 'Availability pending'}
                </span>
              )}
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
          </button>
        </div>

        {/* Right Action Zone */}
        <div className="flex items-center gap-3">
          {/* Switch Storefront <-> Dashboard */}
          {currentUser?.role === 'admin' && (
            <button
              onClick={() => setViewMode(viewMode === 'storefront' ? 'dashboard' : 'storefront')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs ${
                viewMode === 'dashboard'
                  ? 'bg-stone-900 text-amber-400 border border-stone-800'
                  : 'bg-amber-100 text-amber-900 hover:bg-amber-200 border border-amber-300/80'
              }`}
            >
              <ShieldAlert className="w-4 h-4 text-amber-500" />
              <span>{viewMode === 'dashboard' ? 'Return to Store' : 'Admin Dashboard'}</span>
            </button>
          )}

          {/* If not logged in as admin, small toggle to test Admin Dashboard */}
          {(!currentUser || currentUser.role !== 'admin') && (
            <button
              onClick={() => {
                if (currentUser?.role === 'admin') {
                  setViewMode(viewMode === 'storefront' ? 'dashboard' : 'storefront');
                } else {
                  // Direct shortcut to preview Dashboard or sign in as Admin
                  setViewMode(viewMode === 'storefront' ? 'dashboard' : 'storefront');
                }
              }}
              className="hidden lg:flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors"
            >
              <span>{viewMode === 'dashboard' ? 'Store View' : 'Manager View'}</span>
            </button>
          )}

          {/* Cart Button */}
          {viewMode === 'storefront' && (
            <button
              onClick={onOpenCart}
              className="relative flex items-center gap-2.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm shadow-md shadow-amber-500/20 active:scale-95 transition-all"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline font-mono tabular-nums">
                Rs. {cartTotal.toLocaleString()}
              </span>
              {cartCount > 0 && (
                <span className="flex items-center justify-center min-w-5 h-5 px-1 rounded-full bg-stone-950 text-white text-[11px] font-bold">
                  {cartCount}
                </span>
              )}
            </button>
          )}

          {/* User Profile / Auth Button */}
          {currentUser ? (
            <div className="flex items-center gap-2 pl-1">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-stone-200/80 shadow-2xs">
                <img
                  src={currentUser.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.name}`}
                  alt={currentUser.name}
                  className="w-7 h-7 rounded-full bg-stone-100 object-cover"
                />
                <div className="hidden md:flex flex-col text-left">
                  <span className="text-xs font-bold text-stone-800 leading-tight">
                    {currentUser.name.split(' ')[0]}
                  </span>
                  <span className="text-[10px] text-stone-500 leading-tight capitalize font-medium">
                    {currentUser.role}
                  </span>
                </div>
              </div>
              <button
                onClick={onLogout}
                className="p-2 rounded-xl text-stone-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-stone-300 hover:border-amber-500 hover:bg-white text-stone-800 text-xs font-semibold shadow-2xs transition-all"
            >
              <User className="w-4 h-4 text-amber-600" />
              <span>Sign In / Register</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
