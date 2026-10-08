import React from 'react';
import ProductCard from './ProductCard.jsx';

// Visual theme configurations for each section matching the PDF artwork
const SECTION_VISUALS = {
  "delivery-deals": {
    bgGradient: "from-amber-500/10 via-orange-500/5 to-transparent",
    accent: "text-amber-800",
    scriptWord: "Deals",
    mainTitle: "DELIVERY",
    subtext: "Best-selling value bundles packed with burgers, crispy broast, and soft drinks."
  },
  "mega-nosh-deal": {
    bgGradient: "from-orange-500/10 via-amber-500/5 to-transparent",
    accent: "text-orange-800",
    scriptWord: "Deal",
    mainTitle: "MEGA NOSH",
    subtext: "Giant portions designed for family feasts & group hangouts."
  },
  "super-deals": {
    bgGradient: "from-amber-600/10 via-stone-100 to-transparent",
    accent: "text-amber-700",
    scriptWord: "Taste",
    mainTitle: "GET MORE",
    scriptSuffix: "WITH EVERY DEAL",
    subtext: "Six numbered budget deals curated for individuals and duos."
  },
  "appetizers": {
    bgGradient: "from-orange-600/10 via-amber-500/5 to-transparent",
    accent: "text-orange-700",
    scriptWord: "Appetizers",
    mainTitle: "THAT MAKE YOU",
    scriptSuffix: "CRAVE MORE",
    subtext: "Oven-baked wings, flaming buffalo sauce, and gooey cheese sticks."
  },
  "highly-recommended-pizzas": {
    bgGradient: "from-amber-500/15 via-orange-500/5 to-transparent",
    accent: "text-amber-800",
    scriptWord: "Pizzas",
    mainTitle: "THE",
    scriptSuffix: "EVERYONE CAN'T STOP TALKING ABOUT",
    subtext: "Our iconic Crown Crust and Cheesy Stuffed Crust creations."
  },
  "chef-special-pizzas": {
    bgGradient: "from-amber-700/10 via-stone-100 to-transparent",
    accent: "text-amber-800",
    scriptWord: "Chef's",
    mainTitle: "OUR",
    scriptSuffix: "MAGIC MADE JUST FOR YOU",
    subtext: "Malai Boti, Bistro white sauce, All The Meat, and cheese bursts."
  },
  "regular-pizza-flavors": {
    bgGradient: "from-stone-200/40 via-amber-50/50 to-transparent",
    accent: "text-stone-800",
    scriptWord: "Flavors",
    mainTitle: "CLASSIC",
    scriptSuffix: "THAT NEVER GO OUT OF STYLE",
    subtext: "Chicken Fajita, Supreme, Tikka, Sicilian, and Veggie Lover."
  },
  "burgers": {
    bgGradient: "from-orange-500/10 to-transparent",
    accent: "text-orange-800",
    scriptWord: "Bite",
    mainTitle: "TAKE A BIG",
    scriptSuffix: "OF PURE HAPPINESS",
    subtext: "Nom D Max double crunch, spiced burgers, and grilled patties."
  },
  "fried-cravings": {
    bgGradient: "from-amber-500/10 to-transparent",
    accent: "text-amber-800",
    scriptWord: "Crunch",
    mainTitle: "TASTE THE",
    scriptSuffix: "THAT HITS DIFFERENT",
    subtext: "Injected broast, spicy chicken poppers, loaded fries & nuggets."
  },
  "pastas": {
    bgGradient: "from-amber-600/10 to-transparent",
    accent: "text-amber-800",
    scriptWord: "Creamy",
    mainTitle: "DIVE INTO",
    scriptSuffix: "CHEESY PERFECTION",
    subtext: "Oven-baked penne drenched in white bechamel and spicy marinara."
  },
  "sandwiches": {
    bgGradient: "from-stone-100 to-transparent",
    accent: "text-stone-800",
    scriptWord: "Freshness",
    mainTitle: "LAYERED",
    scriptSuffix: "IN EVERY BITE",
    subtext: "Calzone chunks, Mexican sourdough, and pizza stackers."
  },
  "wraps-rolls": {
    bgGradient: "from-orange-500/10 to-transparent",
    accent: "text-orange-800",
    scriptWord: "Flavor",
    mainTitle: "WRAP YOUR HUNGER IN BOLD",
    scriptSuffix: "",
    subtext: "Behari spin rolls, grilled wraps, and soft flatbread rolls."
  },
  "platters": {
    bgGradient: "from-amber-500/10 to-transparent",
    accent: "text-amber-800",
    scriptWord: "Favorites",
    mainTitle: "ALL YOUR",
    scriptSuffix: "ON ONE PLATE",
    subtext: "Combo party platters featuring wings, rolls, loaded fries & sauces."
  },
  "beverages": {
    bgGradient: "from-blue-500/10 via-amber-500/5 to-transparent",
    accent: "text-stone-800",
    scriptWord: "Relax",
    mainTitle: "REFRESH &",
    scriptSuffix: "AND SIP THE CHILL",
    subtext: "Chilled sodas, 1.5L family bottles, and pure mineral water."
  }
};

export default function CategorySection({ category, items, onSelectItem }) {
  if (!items || items.length === 0) return null;

  const visual = SECTION_VISUALS[category.slug] || {
    bgGradient: "from-amber-500/10 to-transparent",
    accent: "text-stone-900",
    scriptWord: category.name,
    mainTitle: "",
    subtext: ""
  };

  return (
    <section id={category.slug} className="scroll-mt-36 py-8">
      {/* Category Themed Banner Header */}
      <div className={`p-6 sm:p-8 rounded-3xl bg-gradient-to-r ${visual.bgGradient} border border-stone-200/60 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs`}>
        <div className="space-y-1">
          <div className="flex items-baseline flex-wrap gap-2">
            {visual.mainTitle && (
              <span className="text-xl sm:text-2xl font-black tracking-tight text-stone-900 uppercase font-['Syne',sans-serif]">
                {visual.mainTitle}
              </span>
            )}
            <span className="text-3xl sm:text-4xl font-extrabold text-amber-600 font-['Syne',sans-serif] italic tracking-tight">
              {visual.scriptWord}
            </span>
            {visual.scriptSuffix && (
              <span className="text-xl sm:text-2xl font-black tracking-tight text-stone-900 uppercase font-['Syne',sans-serif]">
                {visual.scriptSuffix}
              </span>
            )}
          </div>
          {visual.subtext && (
            <p className="text-xs sm:text-sm text-stone-600 font-medium max-w-xl">
              {visual.subtext}
            </p>
          )}
        </div>

        <div className="text-xs font-bold text-amber-800 bg-white/80 backdrop-blur-xs px-3.5 py-1.5 rounded-full border border-amber-200 self-start md:self-auto shrink-0 shadow-2xs">
          {items.length} {items.length === 1 ? 'Item' : 'Items'} available
        </div>
      </div>

      {/* Product Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {items.map((item) => (
          <ProductCard
            key={item.id}
            item={item}
            onSelect={onSelectItem}
          />
        ))}
      </div>
    </section>
  );
}
