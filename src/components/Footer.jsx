import React from 'react';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-stone-900 text-stone-300 border-t border-stone-800 pt-12 pb-8 mt-16 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Col 1: Brand & Contact Info */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-orange-500 flex items-center justify-center text-xl">
              🍕
            </div>
            <span className="font-extrabold text-2xl tracking-tighter text-white uppercase font-['Syne',sans-serif]">
              NOM <span className="text-amber-400">NOSH</span>
            </span>
          </div>

          <div className="space-y-2 text-stone-400">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-amber-400 shrink-0" />
              <a href="tel:+923041118514" className="hover:text-amber-300 transition-colors font-mono font-medium">
                +92 304 1118514
              </a>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-amber-400 shrink-0" />
              <a href="mailto:info@nomnoshpizza.com" className="hover:text-amber-300 transition-colors">
                info@nomnoshpizza.com
              </a>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>88-A, Main Fateh Sher Road, Fateh Sher Colony, Sahiwal, 57000</span>
            </div>
          </div>
        </div>

        {/* Col 2: Restaurant Timings */}
        <div className="space-y-3">
          <h3 className="font-bold text-white uppercase tracking-wider text-sm flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>Our Timings</span>
          </h3>
          <div className="space-y-1 text-stone-400">
            <p className="font-semibold text-stone-300">Monday - Sunday</p>
            <p className="font-mono text-amber-400 font-bold">10:00 AM – 03:00 AM (Late Night)</p>
            <p className="text-[11px] text-stone-500 pt-1">
              *Midnight delivery operates uninterrupted until 3:00 AM daily across Sahiwal city.
            </p>
          </div>
        </div>

        {/* Col 3: Popular Categories */}
        <div className="space-y-3">
          <h3 className="font-bold text-white uppercase tracking-wider text-sm">
            Popular Menu
          </h3>
          <ul className="space-y-1.5 text-stone-400">
            <li><a href="#delivery-deals" className="hover:text-amber-400 transition-colors">Delivery Combos & Deals</a></li>
            <li><a href="#highly-recommended-pizzas" className="hover:text-amber-400 transition-colors">Crown & Stuffed Crust Pizzas</a></li>
            <li><a href="#chef-special-pizzas" className="hover:text-amber-400 transition-colors">Malai Boti & Bistro Flavors</a></li>
            <li><a href="#burgers" className="hover:text-amber-400 transition-colors">Nom Max Crispy Burgers</a></li>
            <li><a href="#appetizers" className="hover:text-amber-400 transition-colors">Flaming Wings & Fries</a></li>
          </ul>
        </div>

        {/* Col 4: Mobile Apps & Socials */}
        <div className="space-y-4">
          <h3 className="font-bold text-white uppercase tracking-wider text-sm">
            Get Our Mobile App
          </h3>
          <p className="text-stone-400 text-xs">
            Download our app for live GPS rider tracking and exclusive push notifications.
          </p>

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-stone-800 hover:bg-stone-750 border border-stone-700 cursor-pointer">
              <span className="text-xl">🤖</span>
              <div>
                <p className="text-[10px] text-stone-400 leading-none">GET IT ON</p>
                <p className="font-bold text-white text-xs leading-tight">Google Play</p>
              </div>
            </div>
            <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-stone-800 hover:bg-stone-750 border border-stone-700 cursor-pointer">
              <span className="text-xl">🍏</span>
              <div>
                <p className="text-[10px] text-stone-400 leading-none">Download on the</p>
                <p className="font-bold text-white text-xs leading-tight">App Store</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright & Sub links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 mt-8 border-t border-stone-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-stone-500 text-[11px]">
        <p>© 2026 NOM NOSH Pizza. All rights reserved. Sahiwal, Pakistan.</p>
        <div className="flex items-center gap-4">
          <a href="#" className="hover:text-stone-400">Terms and conditions</a>
          <span>·</span>
          <a href="#" className="hover:text-stone-400">Privacy Policy</a>
          <span>·</span>
          <a href="#" className="hover:text-stone-400">Sitemap</a>
        </div>
      </div>
    </footer>
  );
}
