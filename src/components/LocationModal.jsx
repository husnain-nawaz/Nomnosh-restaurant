import React, { useState } from 'react';
import { X, MapPin, Check } from 'lucide-react';

export default function LocationModal({ isOpen, onClose, currentLocation, onSelectLocation }) {
  if (!isOpen) return null;

  const popularAreas = [
    "Sahiwal - Fateh Sher Colony (eta 40 min)",
    "Sahiwal - Farid Town (eta 35 min)",
    "Sahiwal - Civil Lines (eta 45 min)",
    "Sahiwal - College Road (eta 40 min)",
    "Sahiwal - Old Harappa Road (eta 50 min)",
    "Sahiwal - Tariq Bin Ziyad Colony (eta 45 min)"
  ];

  const [customAddress, setCustomAddress] = useState('');

  const handleSelect = (loc) => {
    onSelectLocation(loc);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl space-y-4 border border-stone-200 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-amber-600" />
            <h3 className="font-extrabold text-base text-stone-900 font-['Syne',sans-serif]">
              Select Delivery Area
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-stone-400 hover:bg-stone-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-stone-500">
          We deliver fresh hot pizzas across all major sectors of Sahiwal. Select your area below:
        </p>

        <div className="space-y-2">
          {popularAreas.map((area) => {
            const isSelected = currentLocation === area;
            return (
              <button
                key={area}
                onClick={() => handleSelect(area)}
                className={`w-full p-3 rounded-xl border text-left text-xs font-semibold flex items-center justify-between transition-colors ${
                  isSelected
                    ? 'border-amber-500 bg-amber-50/70 text-amber-950'
                    : 'border-stone-200 hover:border-stone-300 text-stone-700'
                }`}
              >
                <span>{area}</span>
                {isSelected && <Check className="w-4 h-4 text-amber-600" />}
              </button>
            );
          })}
        </div>

        <div className="pt-2 border-t">
          <label className="text-[11px] font-bold text-stone-700 block mb-1">
            Or Enter Specific Street Address:
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={customAddress}
              onChange={(e) => setCustomAddress(e.target.value)}
              placeholder="e.g. House 4, Street 9, Sahiwal"
              className="flex-1 px-3 py-2 rounded-xl border border-stone-300 text-xs focus:border-amber-500 outline-hidden"
            />
            <button
              onClick={() => {
                if (customAddress.trim()) {
                  handleSelect(`Sahiwal - ${customAddress.trim()} (eta 45 min)`);
                }
              }}
              className="px-4 py-2 bg-amber-500 text-white font-bold text-xs rounded-xl hover:bg-amber-600"
            >
              Set
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
