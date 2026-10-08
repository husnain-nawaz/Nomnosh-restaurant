import React, { useState } from 'react';
import { X, Plus, Minus, Check, Flame } from 'lucide-react';

export default function ItemCustomizeModal({ item, onClose, onAddToCart }) {
  if (!item) return null;

  const isPizza = item.category_slug.includes('pizza') || item.name.toLowerCase().includes('pizza');

  // Size Options
  const sizeOptions = item.sizes_json && item.sizes_json.length > 0
    ? item.sizes_json.map((s, idx) => ({
        id: `size-${idx}`,
        name: typeof s === 'string' ? s : s.name,
        priceDelta: idx === 0 ? 0 : idx === 1 ? 550 : idx === 2 ? 1100 : 1600
      }))
    : isPizza
    ? [
        { id: 'sm', name: 'Small 7" (Single)', priceDelta: 0 },
        { id: 'md', name: 'Medium 10" (2-3 Persons)', priceDelta: 550 },
        { id: 'lg', name: 'Large 13" (3-4 Persons)', priceDelta: 1100 }
      ]
    : [
        { id: 'std', name: 'Standard Portion', priceDelta: 0 }
      ];

  const crustOptions = [
    { id: 'pan', name: 'Original Pan Crust', priceDelta: 0 },
    { id: 'thin', name: 'Crispy Thin Crust', priceDelta: 0 },
    { id: 'stuffed', name: 'Cheesy Stuffed Crust', priceDelta: 250 },
    { id: 'crown', name: 'Regal Crown Crust', priceDelta: 300 }
  ];

  const spiceLevels = ['Mild', 'Normal', 'Extra Spicy 🔥'];

  const addonOptions = [
    { id: 'extra_cheese', name: 'Extra Mozzarella Cheese', price: 150 },
    { id: 'jalapenos', name: 'Pickled Jalapeños', price: 80 },
    { id: 'mushrooms', name: 'Fresh Sliced Mushrooms', price: 100 },
    { id: 'garlic_sauce', name: 'Signature Garlic Mayo Dip', price: 60 }
  ];

  const [selectedSize, setSelectedSize] = useState(sizeOptions[0]);
  const [selectedCrust, setSelectedCrust] = useState(crustOptions[0]);
  const [selectedSpice, setSelectedSpice] = useState(spiceLevels[1]);
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [quantity, setQuantity] = useState(1);

  const toggleAddon = (addon) => {
    if (selectedAddons.some(a => a.id === addon.id)) {
      setSelectedAddons(selectedAddons.filter(a => a.id !== addon.id));
    } else {
      setSelectedAddons([...selectedAddons, addon]);
    }
  };

  // Calculate Unit & Total Price
  const basePrice = Number(item.price);
  const sizeDelta = selectedSize ? selectedSize.priceDelta : 0;
  const crustDelta = isPizza && selectedCrust ? selectedCrust.priceDelta : 0;
  const addonsTotal = selectedAddons.reduce((sum, a) => sum + a.price, 0);

  const unitPrice = basePrice + sizeDelta + crustDelta + addonsTotal;
  const totalPrice = unitPrice * quantity;

  const handleConfirm = () => {
    const customizedItem = {
      id: item.id,
      name: item.name,
      basePrice: item.price,
      unitPrice,
      totalPrice,
      quantity,
      image_url: item.image_url,
      selectedSize: selectedSize ? selectedSize.name : null,
      selectedCrust: isPizza ? selectedCrust.name : null,
      selectedSpice,
      selectedAddons: selectedAddons.map(a => a.name),
      specialInstructions: specialInstructions.trim()
    };
    onAddToCart(customizedItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header with Image */}
        <div className="relative h-44 sm:h-52 w-full bg-stone-900 shrink-0">
          <img
            src={item.image_url}
            alt={item.name}
            className="w-full h-full object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent" />
          
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-stone-900/80 hover:bg-stone-900 text-stone-200 hover:text-white shadow-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute bottom-4 left-6 right-6">
            <h2 className="text-xl sm:text-2xl font-black text-white leading-tight font-['Syne',sans-serif]">
              {item.name}
            </h2>
            <p className="text-xs text-amber-200 mt-1 line-clamp-1">
              {item.description}
            </p>
          </div>
        </div>

        {/* Scrollable Customization Options */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-stone-800">
          {/* Size Choice */}
          {sizeOptions.length > 1 && (
            <div className="space-y-2.5">
              <label className="text-xs font-bold text-stone-500 uppercase tracking-wider block">
                Select Size / Portion
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {sizeOptions.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setSelectedSize(opt)}
                    className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                      selectedSize?.id === opt.id
                        ? 'border-amber-500 bg-amber-50/70 text-amber-950 font-semibold'
                        : 'border-stone-200 hover:border-stone-300 text-stone-700'
                    }`}
                  >
                    <span className="text-xs">{opt.name}</span>
                    {opt.priceDelta > 0 && (
                      <span className="text-[11px] font-mono text-amber-700 tabular-nums">
                        +Rs. {opt.priceDelta}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Crust Choice (for Pizzas) */}
          {isPizza && (
            <div className="space-y-2.5">
              <label className="text-xs font-bold text-stone-500 uppercase tracking-wider block">
                Choose Crust Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                {crustOptions.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCrust(c)}
                    className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                      selectedCrust.id === c.id
                        ? 'border-amber-500 bg-amber-50/70 text-amber-950 font-semibold'
                        : 'border-stone-200 hover:border-stone-300 text-stone-700'
                    }`}
                  >
                    <span className="text-xs">{c.name}</span>
                    {c.priceDelta > 0 ? (
                      <span className="text-[11px] font-mono text-amber-700 tabular-nums mt-1">
                        +Rs. {c.priceDelta}
                      </span>
                    ) : (
                      <span className="text-[11px] text-stone-400 mt-1">Included</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Spice Level */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold text-stone-500 uppercase tracking-wider block flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-orange-600" />
              <span>Spice Level</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {spiceLevels.map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setSelectedSpice(lvl)}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold text-center transition-all ${
                    selectedSpice === lvl
                      ? 'border-amber-500 bg-amber-50 text-amber-900 shadow-2xs'
                      : 'border-stone-200 text-stone-600 hover:border-stone-300'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Optional Extra Add-ons */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold text-stone-500 uppercase tracking-wider block">
              Extra Toppings & Sauces (Optional)
            </label>
            <div className="space-y-2">
              {addonOptions.map((addon) => {
                const isSelected = selectedAddons.some(a => a.id === addon.id);
                return (
                  <div
                    key={addon.id}
                    onClick={() => toggleAddon(addon)}
                    className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between text-xs transition-colors ${
                      isSelected
                        ? 'border-amber-500 bg-amber-50/60 font-semibold text-amber-950'
                        : 'border-stone-200 hover:border-stone-300 text-stone-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-4 h-4 rounded-md flex items-center justify-center border ${
                        isSelected ? 'bg-amber-600 border-amber-600 text-white' : 'border-stone-300 bg-white'
                      }`}>
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <span>{addon.name}</span>
                    </div>
                    <span className="font-mono text-amber-800 tabular-nums">
                      +Rs. {addon.price}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Special Instructions */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-stone-500 uppercase tracking-wider block">
              Cooking or Delivery Notes
            </label>
            <textarea
              rows={2}
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="e.g. Less onions, extra crispy, call on arrival..."
              className="w-full p-3 rounded-xl border border-stone-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-xs text-stone-800 outline-hidden resize-none"
            />
          </div>
        </div>

        {/* Modal Bottom Bar with Quantity & CTA */}
        <div className="p-4 sm:p-5 bg-stone-50 border-t border-stone-200 flex items-center justify-between gap-4">
          {/* Quantity Stepper */}
          <div className="flex items-center gap-2 bg-white px-2 py-1.5 rounded-xl border border-stone-300 shadow-2xs">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
              className="p-1 rounded-lg hover:bg-stone-100 disabled:opacity-30 text-stone-700"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-8 text-center font-bold text-sm text-stone-900 font-mono tabular-nums">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="p-1 rounded-lg hover:bg-stone-100 text-stone-700"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Add to Cart button */}
          <button
            onClick={handleConfirm}
            className="flex-1 py-3 px-5 rounded-xl bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-bold text-sm shadow-md shadow-amber-500/25 active:scale-95 transition-all flex items-center justify-between"
          >
            <span>Add To Order</span>
            <span className="font-mono tabular-nums font-extrabold">
              Rs. {totalPrice.toLocaleString()}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
