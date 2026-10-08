import React from 'react';
import { X, CheckCircle2, Clock, Bike, UtensilsCrossed, PhoneCall, MapPin, Receipt } from 'lucide-react';

export default function OrderTrackingModal({ order, onClose }) {
  if (!order) return null;

  const steps = [
    { key: 'pending', label: 'Order Received', icon: Clock, desc: 'We have received your order and sent it to the kitchen' },
    { key: 'preparing', label: 'Kitchen Baking', icon: UtensilsCrossed, desc: 'Chefs are topping and oven-baking your fresh pizza' },
    { key: 'on_way', label: 'Out for Delivery', icon: Bike, desc: 'Rider is on the road heading to your address' },
    { key: 'delivered', label: 'Delivered', icon: CheckCircle2, desc: 'Hot & delicious! Enjoy your NOM NOSH feast' }
  ];

  const getStepStatus = (stepKey) => {
    const orderLevels = { pending: 1, preparing: 2, on_way: 3, delivered: 4, cancelled: 0 };
    const currentLevel = orderLevels[order.status] || 1;
    const thisLevel = orderLevels[stepKey];
    if (order.status === 'cancelled') return 'cancelled';
    if (thisLevel < currentLevel) return 'completed';
    if (thisLevel === currentLevel) return 'current';
    return 'upcoming';
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-stone-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header */}
        <div className="p-6 bg-gradient-to-r from-amber-600 via-amber-700 to-orange-700 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-black/20 hover:bg-black/30 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/40 border border-amber-300/30 text-xs font-mono font-bold mb-2">
            <Receipt className="w-3.5 h-3.5" />
            <span>Order #{order.id}</span>
          </div>

          <h2 className="text-2xl font-black font-['Syne',sans-serif]">
            {order.status === 'delivered' ? 'Order Completed!' : 'Hot Food in Progress!'}
          </h2>
          <p className="text-xs text-amber-100 mt-1">
            Estimated Delivery Time: <strong className="text-white">35-45 Minutes</strong>
          </p>
        </div>

        {/* Live Stepper Tracker */}
        <div className="p-6 border-b border-stone-200 bg-stone-50/70">
          <h3 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-4">
            Live Order Progress
          </h3>

          <div className="space-y-4">
            {steps.map((step, idx) => {
              const status = getStepStatus(step.key);
              const StepIcon = step.icon;
              return (
                <div key={step.key} className="flex items-start gap-3 relative">
                  {idx < steps.length - 1 && (
                    <div className={`absolute left-4 top-8 w-0.5 h-8 ${
                      status === 'completed' ? 'bg-amber-600' : 'bg-stone-200'
                    }`} />
                  )}

                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 transition-colors ${
                    status === 'completed'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : status === 'current'
                      ? 'bg-amber-500 text-white ring-4 ring-amber-200 animate-pulse'
                      : 'bg-stone-200 text-stone-400'
                  }`}>
                    <StepIcon className="w-4 h-4" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-bold leading-tight ${
                      status === 'current' ? 'text-amber-800' : status === 'completed' ? 'text-stone-900' : 'text-stone-400'
                    }`}>
                      {step.label}
                    </p>
                    <p className="text-xs text-stone-500 mt-0.5">
                      {step.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Details & Items Summary */}
        <div className="p-6 space-y-4 text-xs text-stone-700">
          <div className="p-3 bg-stone-100/80 rounded-2xl border border-stone-200/80 flex items-start gap-2.5">
            <MapPin className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-stone-900">{order.customer_name} ({order.customer_phone})</p>
              <p className="text-stone-600 mt-0.5">{order.delivery_address}</p>
            </div>
          </div>

          <div>
            <p className="font-bold text-stone-500 uppercase tracking-wider mb-2">Itemized Summary</p>
            <div className="space-y-1.5 divide-y divide-stone-100">
              {order.items_json && order.items_json.map((it, idx) => (
                <div key={idx} className="pt-1.5 flex justify-between items-center text-stone-800">
                  <span className="font-medium">
                    {it.quantity}x {it.name} {it.selectedSize ? `(${it.selectedSize})` : ''}
                  </span>
                  <span className="font-mono font-bold tabular-nums">
                    Rs. {(it.totalPrice || (it.unitPrice * it.quantity) || it.price).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-3 pt-3 border-t border-stone-200 flex justify-between items-center text-sm font-extrabold text-stone-900">
              <span>Total Paid ({order.payment_method})</span>
              <span className="font-mono text-amber-700 tabular-nums text-base">
                Rs. {Number(order.total_amount).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Support CTA */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between gap-3">
          <a
            href="tel:+923041118514"
            className="flex-1 py-2.5 px-3 rounded-xl border border-stone-300 hover:bg-white text-stone-800 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
          >
            <PhoneCall className="w-3.5 h-3.5 text-amber-600" />
            <span>Call Restaurant</span>
          </a>

          <button
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs shadow-xs transition-colors"
          >
            Back to Store
          </button>
        </div>
      </div>
    </div>
  );
}
