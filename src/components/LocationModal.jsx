import React, { useEffect, useState } from 'react';
import { X, MapPin, Check, Loader2, AlertCircle } from 'lucide-react';

export default function LocationModal({ isOpen, currentLocation, onClose, onSelectLocation }) {
  const [manualAddress, setManualAddress] = useState('');
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');
  const [pendingLocation, setPendingLocation] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setStatus('idle');
      setMessage('');
      setPendingLocation(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const resolveLocation = async (payload) => {
    if (payload.latitude !== undefined && payload.longitude !== undefined) {
      const latitude = Number(payload.latitude);
      const longitude = Number(payload.longitude);
      if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) throw new Error('Location coordinates were not available.');
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 12000);
      let response;
      try {
        response = await fetch(`/api/geocode?lat=${encodeURIComponent(latitude)}&lng=${encodeURIComponent(longitude)}`, { signal: controller.signal });
      } catch (error) {
        throw new Error('We found your location, but could not load the address. Please enter it manually.');
      } finally {
        window.clearTimeout(timeout);
      }
      if (!response.ok) throw new Error('We found your location, but could not load the address. Please enter it manually.');
      const data = await response.json();
      setPendingLocation(data);
      setStatus('resolved');
      return;
    }
    const response = await fetch('/api/location/resolve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Unable to resolve this location');
    setPendingLocation(data);
    setStatus('resolved');
  };

  const requestCurrentLocation = () => {
    if (!navigator.geolocation) {
      setStatus('error');
      setMessage('Your browser does not support location access. Please enter your address manually.');
      return;
    }
    setStatus('requesting');
    setMessage('Requesting your current location…');
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const coordinates = { latitude: coords.latitude, longitude: coords.longitude };
        try {
          await resolveLocation(coordinates);
        } catch (error) {
          setPendingLocation({ ...coordinates, address: `Location at ${coordinates.latitude.toFixed(6)}, ${coordinates.longitude.toFixed(6)}`, deliveryAvailable: null, etaMinutes: null });
          setStatus('error');
          setMessage(error.message.startsWith('We found your location')
            ? error.message
            : 'We found your location, but could not load the address. Please enter it manually.');
        }
      },
      (error) => {
        setStatus('error');
        setMessage({
          1: 'Location access was blocked. Allow location access in your browser settings and try again.',
          2: 'Your location is currently unavailable. Check your device settings or enter an address manually.',
          3: 'Location request timed out. Please try again or enter an address manually.'
        }[error.code] || 'We could not access your location. Please enter an address manually.');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const resolveManualAddress = async () => {
    if (!manualAddress.trim()) return;
    setStatus('requesting');
    setMessage('Finding that address…');
    try {
      await resolveLocation({ address: manualAddress.trim() });
    } catch (error) {
      setStatus('error');
      setMessage('We could not find that address. Please check it and try again.');
    }
  };

  const confirmLocation = () => {
    if (pendingLocation) {
      onSelectLocation(pendingLocation);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl space-y-4 border border-stone-200 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-amber-600" />
            <h3 className="font-extrabold text-base text-stone-900 font-['Syne',sans-serif]">Select Delivery Location</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-stone-400 hover:bg-stone-100"><X className="w-5 h-5" /></button>
        </div>

        <p className="text-xs text-stone-500">Use your current location or enter an address. Your choice is saved only after confirmation.</p>

        <button
          onClick={requestCurrentLocation}
          disabled={status === 'requesting'}
          className="w-full p-3 rounded-xl border border-amber-500 bg-amber-50/70 text-amber-950 text-xs font-bold flex items-center justify-center gap-2 hover:bg-amber-100 disabled:opacity-60"
        >
          {status === 'requesting' ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
          Use my current location
        </button>

        {message && (
          <p className={`text-xs p-2.5 rounded-xl flex gap-2 ${status === 'error' ? 'text-rose-700 bg-rose-50 border border-rose-200' : 'text-stone-600 bg-stone-50'}`}>
            {status === 'error' && <AlertCircle className="w-4 h-4 shrink-0" />}{message}
          </p>
        )}

        {pendingLocation && (
          <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50 text-xs text-emerald-950 space-y-1">
            <p className="font-bold flex items-center gap-1"><Check className="w-4 h-4" /> Detected location</p>
            <p>{pendingLocation.address || `Coordinates: ${pendingLocation.latitude.toFixed(6)}, ${pendingLocation.longitude.toFixed(6)}`}</p>
            <p>{pendingLocation.deliveryAvailable === false ? 'Delivery is not currently available in this area.' : pendingLocation.etaMinutes ? `Estimated delivery: ${pendingLocation.etaMinutes} min` : 'Delivery availability will be confirmed shortly.'}</p>
            <button onClick={confirmLocation} className="mt-2 w-full py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold">Confirm this location</button>
          </div>
        )}

        <div className="pt-2 border-t">
          <label className="text-[11px] font-bold text-stone-700 block mb-1">Enter a location manually</label>
          <div className="flex gap-2">
            <input type="text" value={manualAddress} onChange={(e) => setManualAddress(e.target.value)} placeholder="Street address, city" className="flex-1 px-3 py-2 rounded-xl border border-stone-300 text-xs focus:border-amber-500 outline-hidden" />
            <button onClick={resolveManualAddress} disabled={status === 'requesting' || !manualAddress.trim()} className="px-4 py-2 bg-amber-500 text-white font-bold text-xs rounded-xl hover:bg-amber-600 disabled:opacity-50">Find</button>
          </div>
        </div>
        {currentLocation && <p className="text-[11px] text-stone-400">Current saved location: {currentLocation.address}</p>}
      </div>
    </div>
  );
}
