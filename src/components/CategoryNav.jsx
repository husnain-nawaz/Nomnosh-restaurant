import React, { useRef } from 'react';
import { Search, ChevronLeft, ChevronRight, X } from 'lucide-react';

export default function CategoryNav({
  categories,
  activeCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange
}) {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const offset = direction === 'left' ? -250 : 250;
      scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  return (
    <div className="sticky top-20 z-30 bg-[#FFFDF9]/95 backdrop-blur-md border-b border-stone-200/80 py-3 px-4 sm:px-6 lg:px-8 space-y-3">
      {/* Search Input Bar */}
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-xl">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search for pizza, burger, wings, deals..."
            className="w-full pl-10 pr-10 py-2.5 bg-stone-100 hover:bg-stone-200/60 focus:bg-white text-stone-900 text-sm rounded-xl border border-stone-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-hidden transition-all placeholder:text-stone-400"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Quick Category Jump arrows for desktop */}
        <div className="hidden sm:flex items-center gap-1">
          <button
            onClick={() => scroll('left')}
            className="p-2 rounded-lg border border-stone-200 hover:bg-stone-100 text-stone-600 transition-colors"
            title="Scroll categories left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="p-2 rounded-lg border border-stone-200 hover:bg-stone-100 text-stone-600 transition-colors"
            title="Scroll categories right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Category Tab Bar */}
      <div className="max-w-7xl mx-auto relative flex items-center">
        <div
          ref={scrollRef}
          className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth py-1"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <button
            onClick={() => onSelectCategory('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-all ${
              activeCategory === 'all'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200 hover:text-stone-900'
            }`}
          >
            All Items
          </button>

          {categories.map((cat) => {
            const isActive = activeCategory === cat.slug;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.slug)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition-all ${
                  isActive
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200 hover:text-stone-900'
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
