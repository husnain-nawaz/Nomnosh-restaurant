import React, { useState } from 'react';
import { X, Trash2, ShoppingBag, Plus, Minus, Tag, Check, Truck, Store, ArrowRight, Loader2 } from 'lucide-react';

export default function CartDrawer({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  currentUser,
  onOrderPlaced
}) {
  if (!isOpen) return null;

  const [orderType, setOrderType] = useState('delivery'); // 'delivery' | 'takeaway'
  const [couponCode, setCouponCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [couponMsg, setCouponMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Checkout form fields
  const [customerName, setCustomerName] = useState(currentUser?.name || '');
  const [customerPhone, setCustomerPhone] = useState(currentUser?.phone || '+92 300 1234567');
  const [deliveryAddress, setDeliveryAddress] = useState(currentUser?.address || '');
  const [paymentMethod, setPaymentMethod] = useState('cash_on_delivery');
  const [orderNotes, setOrderNotes] = useState('');

  // Financial calculations
  const subtotal = cart.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  const deliveryFee = orderType === 'delivery' && subtotal > 0 ? 100 : 0;
  const discountAmount = Math.round(subtotal * appliedDiscount);
  const totalAmount = Math.max(0, subtotal + deliveryFee - discountAmount);

  const applyCoupon = () => {
    const code = couponCode.trim().toUpperCase();
    if (code === 'MIDNIGHT') {
      setAppliedDiscount(0.15);
      setCouponMsg('15% Midnight Discount Applied!');
    } else if (code === 'WELCOME10') {
      setAppliedDiscount(0.10);
      setCouponMsg('10% Welcome Discount Applied!');
    } else {
      setCouponMsg('Invalid coupon code. Try MIDNIGHT');
      setTimeout(() => setCouponMsg(''), 3000);
    }
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (cart.length === 0) {
      setErrorMsg('Your cart is empty');
      return;
    }
    if (!customerName || !customerPhone || (orderType === 'delivery' && !deliveryAddress)) {
      setErrorMsg('Please complete all required contact and delivery fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          customer_name: customerName,
          customer_phone: customerPhone,
          customer_email: currentUser?.email || '',
          delivery_address: orderType === 'delivery' ? deliveryAddress : 'Takeaway from store',
          city: 'Sahiwal',
          order_type: orderType,
          items: cart,
          subtotal,
          delivery_fee: deliveryFee,
          discount: discountAmount,
          total_amount: totalAmount,
          payment_method: paymentMethod,
          notes: orderNotes
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to place order');
      }

      onClearCart();
      onClose();
      onOrderPlaced(data);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-stone-950/60 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="px-5 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-amber-600" />
            <h2 className="font-extrabold text-stone-900 text-lg font-['Syne',sans-serif]">
              Your Order ({cart.reduce((s, i) => s + i.quantity, 0)})
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Order Type Toggle: Delivery vs Takeaway */}
        <div className="p-3 bg-stone-100 border-b border-stone-200">
          <div className="grid grid-cols-2 p-1 bg-stone-200 rounded-xl gap-1">
            <button
              onClick={() => setOrderType('delivery')}
              className={`py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                orderType === 'delivery'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Truck className="w-4 h-4 text-amber-600" />
              <span>Delivery (45 min)</span>
            </button>
            <button
              onClick={() => setOrderType('takeaway')}
              className={`py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                orderType === 'takeaway'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Store className="w-4 h-4 text-amber-600" />
              <span>Self Pickup</span>
            </button>
          </div>
        </div>

        {/* Middle Content: Items List + Form */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {cart.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <p className="font-bold text-stone-800 text-base">Your cart is empty</p>
              <p className="text-xs text-stone-500 max-w-xs mx-auto">
                Discover our delicious oven-baked pizzas, zinger burgers, and exclusive midnight deals!
              </p>
              <button
                onClick={onClose}
                className="mt-2 px-5 py-2.5 rounded-xl bg-amber-500 text-white font-bold text-xs hover:bg-amber-600 shadow-xs"
              >
                Start Browsing Menu
              </button>
            </div>
          ) : (
            <>
              {/* Items in Cart */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-stone-500 uppercase tracking-wider">
                  <span>Selected Items</span>
                  <button
                    onClick={onClearCart}
                    className="text-rose-600 hover:underline capitalize font-semibold"
                  >
                    Clear All
                  </button>
                </div>

                <div className="divide-y divide-stone-100">
                  {cart.map((item, idx) => (
                    <div key={`${item.id}-${idx}`} className="py-3 flex items-start gap-3">
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-14 h-14 rounded-xl object-cover bg-stone-100 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-stone-900 truncate">
                          {item.name}
                        </h4>
                        <div className="text-[11px] text-stone-500 space-y-0.5 mt-0.5">
                          {item.selectedSize && <div>Size: {item.selectedSize}</div>}
                          {item.selectedCrust && <div>Crust: {item.selectedCrust}</div>}
                          {item.selectedSpice && <div>Spice: {item.selectedSpice}</div>}
                          {item.selectedAddons && item.selectedAddons.length > 0 && (
                            <div>Extras: {item.selectedAddons.join(', ')}</div>
                          )}
                        </div>

                        {/* Price & Quantity Controls */}
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-xs font-mono font-bold text-amber-800 tabular-nums">
                            Rs. {(item.unitPrice * item.quantity).toLocaleString()}
                          </span>

                          <div className="flex items-center gap-1.5 bg-stone-100 px-1.5 py-0.5 rounded-lg border border-stone-200">
                            <button
                              onClick={() => onUpdateQuantity(idx, item.quantity - 1)}
                              className="p-1 hover:text-rose-600 text-stone-600"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-5 text-center font-bold text-xs font-mono tabular-nums text-stone-900">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => onUpdateQuantity(idx, item.quantity + 1)}
                              className="p-1 text-stone-600 hover:text-stone-900"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => onRemoveItem(idx)}
                              className="ml-1 p-1 text-stone-400 hover:text-rose-600"
                              title="Delete"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Promo Code Section */}
              <div className="p-3 bg-amber-50/60 rounded-2xl border border-amber-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-amber-600" />
                    <span>Have a Promo Code?</span>
                  </label>
                  <span className="text-[10px] text-amber-800 font-semibold">Try MIDNIGHT</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Enter MIDNIGHT or WELCOME10"
                    className="flex-1 px-3 py-1.5 rounded-xl border border-stone-300 text-xs bg-white text-stone-900 uppercase font-mono tracking-wider focus:outline-hidden focus:border-amber-500"
                  />
                  <button
                    onClick={applyCoupon}
                    className="px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs transition-colors"
                  >
                    Apply
                  </button>
                </div>
                {couponMsg && (
                  <p className={`text-[11px] font-medium ${appliedDiscount > 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                    {couponMsg}
                  </p>
                )}
              </div>

              {/* Customer Details Form */}
              <form id="checkout-form" onSubmit={handleCheckout} className="space-y-3">
                <h3 className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                  Contact & Delivery Details
                </h3>

                <div>
                  <label className="text-[11px] font-semibold text-stone-700 block mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Sale Meezu"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:border-amber-500 text-xs text-stone-900 outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-stone-700 block mb-1">
                    Phone Number (Rider will call here) *
                  </label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="0300 1234567"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:border-amber-500 text-xs text-stone-900 outline-hidden font-mono"
                  />
                </div>

                {orderType === 'delivery' && (
                  <div>
                    <label className="text-[11px] font-semibold text-stone-700 block mb-1">
                      Complete Street Address *
                    </label>
                    <textarea
                      rows={2}
                      required
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder="House / Flat No, Street, Colony"
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:border-amber-500 text-xs text-stone-900 outline-hidden resize-none"
                    />
                  </div>
                )}

                <div>
                  <label className="text-[11px] font-semibold text-stone-700 block mb-1">
                    Payment Method
                  </label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('cash_on_delivery')}
                      className={`p-2.5 rounded-xl border text-left font-semibold transition-all ${
                        paymentMethod === 'cash_on_delivery'
                          ? 'border-amber-500 bg-amber-50/70 text-amber-950'
                          : 'border-stone-200 text-stone-700 hover:border-stone-300'
                      }`}
                    >
                      💵 Cash on Delivery
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('easypaisa')}
                      className={`p-2.5 rounded-xl border text-left font-semibold transition-all ${
                        paymentMethod === 'easypaisa'
                          ? 'border-amber-500 bg-amber-50/70 text-amber-950'
                          : 'border-stone-200 text-stone-700 hover:border-stone-300'
                      }`}
                    >
                      📱 EasyPaisa / JazzCash
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-stone-700 block mb-1">
                    Order Instructions (Optional)
                  </label>
                  <input
                    type="text"
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    placeholder="e.g. Ring bell twice, deliver hot"
                    className="w-full px-3 py-1.5 rounded-xl border border-stone-300 focus:border-amber-500 text-xs text-stone-900 outline-hidden"
                  />
                </div>

                {errorMsg && (
                  <p className="text-xs text-rose-600 bg-rose-50 p-2.5 rounded-xl border border-rose-200">
                    {errorMsg}
                  </p>
                )}
              </form>
            </>
          )}
        </div>

        {/* Bottom Checkout Actions */}
        {cart.length > 0 && (
          <div className="p-5 bg-stone-50 border-t border-stone-200 space-y-3">
            <div className="space-y-1.5 text-xs text-stone-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-mono tabular-nums font-semibold text-stone-900">
                  Rs. {subtotal.toLocaleString()}
                </span>
              </div>
              {orderType === 'delivery' && (
                <div className="flex justify-between">
                  <span>Standard Delivery Fee</span>
                  <span className="font-mono tabular-nums font-semibold text-stone-900">
                    Rs. {deliveryFee}
                  </span>
                </div>
              )}
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Discount</span>
                  <span className="font-mono tabular-nums">
                    -Rs. {discountAmount.toLocaleString()}
                  </span>
                </div>
              )}
              <div className="pt-2 border-t border-stone-200 flex justify-between text-base font-extrabold text-stone-900">
                <span>Total Amount</span>
                <span className="font-mono tabular-nums text-amber-700">
                  Rs. {totalAmount.toLocaleString()}
                </span>
              </div>
            </div>

            <button
              type="submit"
              form="checkout-form"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-extrabold text-sm shadow-md shadow-amber-500/25 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Placing Your Order...</span>
                </>
              ) : (
                <>
                  <span>Confirm & Place Order</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
