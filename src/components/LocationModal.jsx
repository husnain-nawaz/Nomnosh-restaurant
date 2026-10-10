import React, { useEffect, useRef, useState } from 'react';
import { AlertCircle, Check, Loader2, MapPin, Search, X } from 'lucide-react';

const jsonResponse = async (response) => {
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) throw new Error('Unable to search locations. Please try again.');
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Unable to search locations. Please try again.');
  return data;
};

const searchPublicGeocoder = async (text, signal) => {
  const response = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=6&countrycodes=pk&viewbox=69.0,37.5,74.5,27.5&bounded=1&q=${encodeURIComponent(`${text}, Punjab, Pakistan`)}`, { signal, headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error('The address search service is temporarily unavailable.');
  const items = await response.json();
  const places = items.map((item) => {
    const address = item.address || {};
    return {
      formattedAddress: item.display_name,
      address: item.display_name,
      placeName: item.name || item.display_name.split(',')[0],
      latitude: Number(item.lat),
      longitude: Number(item.lon),
      city: address.city || address.town || address.village || address.municipality || address.county || '',
      stateOrProvince: address.state || address.region || '',
      country: address.country || '',
      postalCode: address.postcode || '',
      addressComponents: address,
      placeId: `osm:${item.osm_type || 'place'}:${item.osm_id || item.place_id}`
    };
  });
  const scopedPlaces = places.filter((place) => `${place.formattedAddress} ${place.country} ${place.stateOrProvince}`.toLowerCase().includes('pakistan'));
  if (scopedPlaces.length) return scopedPlaces;

  const photonResponse = await fetch(`https://photon.komoot.io/api/?limit=6&q=${encodeURIComponent(`${text}, Punjab, Pakistan`)}`, { signal, headers: { Accept: 'application/json' } });
  if (!photonResponse.ok) throw new Error('The address search service is temporarily unavailable.');
  const photon = await photonResponse.json();
  return (photon.features || []).map((feature) => {
    const props = feature.properties || {};
    const [longitude, latitude] = feature.geometry.coordinates;
    return {
      formattedAddress: [props.name, props.street, props.housenumber, props.city || props.county, props.state, props.country, props.postcode].filter(Boolean).join(', '),
      address: [props.name, props.street, props.housenumber, props.city || props.county, props.state, props.country, props.postcode].filter(Boolean).join(', '),
      placeName: props.name || props.street || props.city || props.country || text,
      latitude, longitude, city: props.city || props.county || '', stateOrProvince: props.state || '', country: props.country || '', postalCode: props.postcode || '', addressComponents: props,
      placeId: `photon:${props.osm_type || 'place'}:${props.osm_id || `${latitude},${longitude}`}`
    };
  }).filter((place) => `${place.formattedAddress} ${place.country} ${place.stateOrProvince}`.toLowerCase().includes('pakistan'));
};

export default function LocationModal({ isOpen, currentLocation, onClose, onSelectLocation }) {
  const inputRef = useRef(null);
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [searching, setSearching] = useState(false);
  const [searchState, setSearchState] = useState('idle');
  const [message, setMessage] = useState('Enter your delivery address');
  const [locating, setLocating] = useState(false);
  const searchIdRef = useRef(0);

  useEffect(() => {
    if (!isOpen) return;
    const closeSuggestions = (event) => {
      if (!event.target.closest('[data-location-search]')) setSuggestions([]);
    };
    document.addEventListener('mousedown', closeSuggestions);
    return () => document.removeEventListener('mousedown', closeSuggestions);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    setQuery('');
    setSuggestions([]);
    setSelected(null);
    setActiveIndex(-1);
    setSearchState('idle');
    setMessage('Enter your delivery address');
    window.setTimeout(() => inputRef.current?.focus(), 50);
  }, [isOpen]);

  useEffect(() => {
    const text = query.trim();
    if (!isOpen || selected || text.length < 2) {
      setSuggestions([]);
      setSearching(false);
      if (!selected) { setSearchState('idle'); setMessage('Enter your delivery address'); }
      return undefined;
    }

    const controller = new AbortController();
    const requestId = ++searchIdRef.current;
    setSearching(true);
    setSearchState('loading');
    setMessage('Searching for locations…');
    const timer = window.setTimeout(async () => {
      try {
        let results;
        try {
          const response = await fetch(`/api/geocode/search?q=${encodeURIComponent(text)}`, { signal: controller.signal });
          const data = await jsonResponse(response);
          results = Array.isArray(data.results) ? data.results : [];
          if (!results.length) results = await searchPublicGeocoder(text, controller.signal);
        } catch (backendError) {
          if (controller.signal.aborted) throw backendError;
          results = await searchPublicGeocoder(text, controller.signal);
        }
        if (requestId !== searchIdRef.current) return;
        setSuggestions(results);
        setActiveIndex(results.length ? 0 : -1);
        setSearchState(results.length ? 'results' : 'empty');
        setMessage(results.length ? '' : 'No matching locations found');
      } catch (error) {
        if (error.name !== 'AbortError') {
          if (requestId !== searchIdRef.current) return;
          setSuggestions([]);
          setSearchState('error');
          setMessage(error.message || 'Unable to search locations. Please try again.');
        }
      } finally {
        if (!controller.signal.aborted) setSearching(false);
      }
    }, 400);

    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [isOpen, query, selected]);

  if (!isOpen) return null;

  const chooseSuggestion = (place) => {
    setSelected(place);
    setQuery(place.formattedAddress);
    setSuggestions([]);
    setActiveIndex(-1);
    setSearchState('selected');
    setMessage('Address selected. Confirm it below to save this location.');
  };

  const handleInput = (event) => {
    setQuery(event.target.value);
    setSelected(null);
    setMessage(event.target.value.trim().length ? 'Please select an address from the suggestions.' : 'Enter your delivery address');
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Escape') { setSuggestions([]); setActiveIndex(-1); return; }
    if (!suggestions.length) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % suggestions.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((index) => (index <= 0 ? suggestions.length - 1 : index - 1));
    } else if (event.key === 'Enter' && activeIndex >= 0) {
      event.preventDefault();
      chooseSuggestion(suggestions[activeIndex]);
    }
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) { setSearchState('error'); setMessage('Location access is not supported by this browser.'); return; }
    setLocating(true);
    setMessage('Finding your current location…');
    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      try {
        const response = await fetch(`/api/geocode?lat=${encodeURIComponent(coords.latitude)}&lng=${encodeURIComponent(coords.longitude)}`);
        const data = await jsonResponse(response);
        chooseSuggestion({
          formattedAddress: data.address,
          placeName: data.address?.split(',')[0] || 'Current location',
          latitude: data.latitude, longitude: data.longitude,
          city: data.city || '', stateOrProvince: data.stateOrProvince || data.region || '', country: data.country || '',
          postalCode: data.postalCode || '', placeId: `coordinates:${data.latitude},${data.longitude}`,
          locationSource: 'current',
          deliveryAvailable: data.deliveryAvailable, etaMinutes: data.etaMinutes
        });
      } catch { setSearchState('error'); setMessage('Unable to resolve your current location. Please search for an address.'); }
      finally { setLocating(false); }
    }, (error) => { setLocating(false); setSearchState('error'); setMessage(error.code === 1 ? 'Location permission was denied. Please allow access or search for an address.' : error.code === 3 ? 'Location request timed out. Please try again or search for an address.' : 'Your current location is unavailable. Please search for an address.'); }, { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 });
  };

  const confirm = () => {
    if (!selected) { setSearchState('error'); setMessage('Please select an address from the suggestions.'); return; }
    onSelectLocation({ ...selected, address: selected.formattedAddress });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-stone-950/70 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-md space-y-4 overflow-visible rounded-3xl border border-stone-200 bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-2"><MapPin className="h-5 w-5 text-amber-600" /><h3 className="font-['Syne',sans-serif] text-base font-extrabold text-stone-900">Select Delivery Location</h3></div>
          <button type="button" onClick={onClose} className="rounded-lg p-1 text-stone-400 hover:bg-stone-100" aria-label="Close"><X className="h-5 w-5" /></button>
        </div>

        <p className="text-xs text-stone-500">Search worldwide and select an exact address. It is saved only after confirmation.</p>

        <div className="relative z-40" data-location-search>
          <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-stone-400" />
          <label htmlFor="delivery-location-search" className="sr-only">Search Lahore, Sahiwal, or Punjab, Pakistan</label><input id="delivery-location-search" ref={inputRef} value={query} onChange={handleInput} onKeyDown={handleKeyDown} placeholder="Search Lahore, Sahiwal, or Punjab, Pakistan" autoComplete="off" role="combobox" aria-expanded={suggestions.length > 0} aria-controls="delivery-location-list" aria-activedescendant={activeIndex >= 0 ? `location-option-${activeIndex}` : undefined} aria-autocomplete="list" className="w-full rounded-xl border border-stone-300 py-2.5 pl-9 pr-10 text-xs outline-hidden focus:border-amber-500 focus:ring-2 focus:ring-amber-100" />
          {searching && <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-amber-600" />}

          {(searching || suggestions.length > 0 || searchState === 'empty' || searchState === 'error') && !selected && (
            <div id="delivery-location-list" className="absolute left-0 right-0 top-full z-[100] mt-1 max-h-64 overflow-y-auto rounded-xl border border-stone-200 bg-white shadow-2xl" role="listbox">
              {searching && <p className="flex items-center gap-2 px-3 py-3 text-xs text-stone-500"><Loader2 className="h-4 w-4 animate-spin" />Searching for locations…</p>}
              {!searching && searchState === 'empty' && <p className="px-3 py-3 text-xs text-stone-500">No matching locations found</p>}
              {!searching && searchState === 'error' && <p className="px-3 py-3 text-xs text-rose-700">{message}</p>}
              {!searching && suggestions.map((place, index) => (
                <button id={`location-option-${index}`} key={place.placeId} type="button" role="option" aria-selected={index === activeIndex} onMouseDown={(event) => event.preventDefault()} onClick={() => chooseSuggestion(place)} className={`block w-full border-b border-stone-100 px-3 py-2.5 text-left last:border-0 ${index === activeIndex ? 'bg-amber-50' : 'hover:bg-stone-50'}`}>
                  <span className="block text-xs font-bold text-stone-900">{place.placeName}</span>
                  <span className="block text-[11px] text-stone-500">{place.formattedAddress}</span>
                  {(place.city || place.stateOrProvince || place.country) && <span className="block text-[10px] text-stone-400">{[place.city, place.stateOrProvince, place.country].filter(Boolean).join(' · ')}</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        <button type="button" onClick={useCurrentLocation} disabled={locating} className="flex w-full items-center justify-center gap-2 rounded-xl border border-amber-500 bg-amber-50/70 p-3 text-xs font-bold text-amber-950 hover:bg-amber-100 disabled:opacity-60">
          {locating ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}Use my current location
        </button>

        {message && <p className={`flex gap-2 rounded-xl p-2.5 text-xs ${searchState === 'error' ? 'border border-rose-200 bg-rose-50 text-rose-700' : 'bg-stone-50 text-stone-600'}`}>{searchState === 'error' && <AlertCircle className="h-4 w-4 shrink-0" />}{message}</p>}

        {selected && <div className="space-y-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-950">
          <p className="flex items-center gap-1 font-bold"><Check className="h-4 w-4" />Selected location</p>
          <iframe title="Selected delivery location" src={`https://www.openstreetmap.org/export/embed.html?bbox=${selected.longitude - 0.01}%2C${selected.latitude - 0.01}%2C${selected.longitude + 0.01}%2C${selected.latitude + 0.01}&layer=mapnik&marker=${selected.latitude}%2C${selected.longitude}`} className="h-40 w-full rounded-lg border-0" loading="lazy" />
          <p>{selected.formattedAddress}</p>
          <p className="text-[11px] text-emerald-700">Coordinates: {selected.latitude}, {selected.longitude}</p>
        </div>}

        <button type="button" onClick={confirm} disabled={!selected} className="w-full rounded-xl bg-amber-500 py-3 text-xs font-bold text-white hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-45">Confirm location</button>
        {currentLocation && <p className="text-[11px] text-stone-400">Current saved location: {currentLocation.formattedAddress || currentLocation.address}</p>}
      </div>
    </div>
  );
}
