import React, { useState } from 'react';
import { Heart, Plus, Sparkles } from 'lucide-react';

export default function ProductCard({ item, onSelect, onQuickAdd }) {
  const [isLiked, setIsLiked] = useState(false);
  const [imgError, setImgError] = useState(false);

  const formatPrice = (p) => {
    return Number(p).toLocaleString('en-PK', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  return (
    <div className="group flex flex-col bg-white rounded-2xl border border-stone-200/80 hover:border-amber-400 overflow-hidden shadow-2xs hover:shadow-lg transition-all duration-200">
      {/* Product Image Box */}
      <div className="relative aspect-4/3 w-full bg-stone-100 overflow-hidden cursor-pointer" onClick={() => onSelect(item)}>
        {!imgError ? (
          <img
            src={item.image_url}
            alt={item.name}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100 text-stone-600 p-4 text-center">
            <span className="text-4xl mb-1">🍕</span>
            <span className="text-xs font-semibold text-stone-700">{item.name}</span>
          </div>
        )}

        {/* Favorite Heart Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsLiked(!isLiked);
          }}
          className="absolute top-2.5 right-2.5 p-2 rounded-full bg-white/90 hover:bg-white text-stone-400 hover:text-rose-500 shadow-xs transition-colors backdrop-blur-xs"
          title={isLiked ? "Remove favorite" : "Add to favorites"}
        >
          <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
        </button>

        {/* Deal / Special Tag */}
        {item.is_deal && (
          <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-md bg-amber-500 text-stone-950 font-bold text-[10px] uppercase tracking-wider shadow-xs flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            <span>Value Deal</span>
          </div>
        )}

        {/* Original Price Strike */}
        {item.original_price && (
          <div className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded-md bg-stone-900/80 text-amber-200 text-xs font-mono line-through backdrop-blur-xs tabular-nums">
            Rs. {formatPrice(item.original_price)}
          </div>
        )}
      </div>

      {/* Content Details */}
      <div className="flex-1 p-4 flex flex-col justify-between space-y-3">
        <div>
          <h3
            onClick={() => onSelect(item)}
            className="font-bold text-stone-900 text-base leading-snug group-hover:text-amber-700 transition-colors cursor-pointer line-clamp-1"
          >
            {item.name}
          </h3>
          <p className="text-xs text-stone-500 leading-relaxed mt-1 line-clamp-2">
            {item.description || "Freshly baked authentic Pakistani recipe with rich signature crust and seasonings."}
          </p>
        </div>

        {/* Price & Action */}
        <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-3">
          <div className="flex flex-col">
            <span className="text-[10px] text-stone-500 font-medium">Price</span>
            <span className="text-base font-extrabold text-amber-700 font-mono tabular-nums">
              {item.sizes_json && item.sizes_json.length > 1 ? 'from ' : ''}
              Rs. {formatPrice(item.price)}
            </span>
          </div>

          <button
            onClick={() => onSelect(item)}
            className="flex-1 max-w-[130px] py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-bold text-xs shadow-xs active:scale-95 transition-all flex items-center justify-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add To Cart</span>
          </button>
        </div>
      </div>
    </div>
  );
}
