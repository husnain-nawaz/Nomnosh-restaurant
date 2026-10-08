import React from 'react';
import { ArrowRight, Clock, Flame, Percent } from 'lucide-react';

export default function HeroBanner({ onSelectCategory, onOpenDealModal }) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-amber-600 via-amber-700 to-orange-800 text-white rounded-3xl mx-4 sm:mx-6 lg:mx-8 my-6 shadow-xl shadow-orange-950/15">
      {/* Background patterned textures */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 sm:px-10 py-10 sm:py-14 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Headlines */}
        <div className="lg:col-span-7 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/30 border border-amber-300/40 text-amber-100 text-xs font-semibold backdrop-blur-xs">
            <Clock className="w-3.5 h-3.5 text-amber-200" />
            <span>Offer valid 10:00 PM to 3:00 AM only</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.05] text-white font-['Syne',sans-serif] uppercase">
            Midnight <span className="text-amber-300">Nosh</span> Farmaiye!
          </h1>

          <p className="text-base sm:text-lg text-amber-100/90 max-w-xl font-medium leading-relaxed">
            Order any <strong className="text-white underline decoration-amber-300 underline-offset-4">Highly Recommended Pizza</strong> and get <span className="bg-amber-400 text-stone-950 px-2 py-0.5 rounded-md font-bold">1 Small Regular Pizza FREE</span> directly to your doorstep.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4">
            <button
              onClick={() => onSelectCategory('highly-recommended-pizzas')}
              className="px-6 py-3.5 rounded-xl bg-white text-stone-900 hover:bg-amber-100 font-bold text-sm shadow-lg shadow-stone-950/20 active:scale-95 transition-all flex items-center gap-2"
            >
              <Flame className="w-4 h-4 text-orange-600" />
              <span>Claim Midnight Offer</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onSelectCategory('delivery-deals')}
              className="px-5 py-3.5 rounded-xl bg-amber-900/40 hover:bg-amber-900/60 border border-amber-300/30 text-amber-100 font-semibold text-sm backdrop-blur-xs transition-colors flex items-center gap-2"
            >
              <Percent className="w-4 h-4 text-amber-300" />
              <span>Explore Deals & Combos</span>
            </button>
          </div>

          {/* Guarantee Badges */}
          <div className="pt-4 grid grid-cols-3 gap-3 border-t border-amber-400/20 text-xs text-amber-200 font-medium">
            <div>🔥 Fresh Hand-Tossed Dough</div>
            <div>⚡ 45 Min Hot Delivery</div>
            <div>🧀 100% Real Mozzarella</div>
          </div>
        </div>

        {/* Right Column: Hero Visual Showcase */}
        <div className="lg:col-span-5 relative flex justify-center">
          <div className="relative group">
            {/* Glowing backdrop */}
            <div className="absolute -inset-4 bg-amber-400/20 rounded-full blur-2xl group-hover:bg-amber-400/30 transition-all" />
            
            <div className="relative rounded-2xl overflow-hidden border-4 border-amber-300/30 shadow-2xl shadow-stone-950/40 transform hover:scale-[1.02] transition-transform duration-300">
              <img
                src="/src/assets/images/hero_midnight_pizza_1791465648676.jpg"
                alt="NOM NOSH Stuffed Crust Pizza"
                className="w-full h-72 sm:h-80 object-cover object-center"
              />
              <div className="absolute top-3 right-3 bg-stone-950/80 backdrop-blur-md text-amber-400 border border-amber-400/40 px-3 py-1 rounded-full text-xs font-bold">
                ⭐ Bestseller
              </div>
              <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-stone-950/90 via-stone-950/50 to-transparent flex items-end justify-between">
                <div>
                  <p className="text-xs text-amber-300 font-semibold uppercase tracking-wider">Chef Signature</p>
                  <p className="text-base font-bold text-white">Crown & Stuffed Crust Collection</p>
                </div>
                <span className="text-lg font-mono font-bold text-amber-300 tabular-nums">From Rs. 650</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
