"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  ADDRESS_STATES,
  LGA_BY_STATE,
  ALL_LGAS,
  getHubFromAddress,
} from "@/data/address-constants";
import type { StructuredAddressValue } from "@/types/address";

const GOOGLE_SCRIPT_ID = "google-maps-script";
const NIGERIA_BOUNDS = { latMin: 4.0, latMax: 14.0, lngMin: 2.7, lngMax: 14.7 };

type StructuredAddressFieldProps = {
  label: string;
  value: StructuredAddressValue;
  onChange: (v: StructuredAddressValue) => void;
  namePrefix: string;
  showMapPreview?: boolean;
  required?: boolean;
  suggestedHub?: string | null;
  onHubSuggest?: (hub: string | null) => void;
};

function loadGoogleScript(apiKey: string): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  const existing = document.getElementById(GOOGLE_SCRIPT_ID);
  if (existing) {
    return (window as unknown as { __googleMapsLoaded?: Promise<void> }).__googleMapsLoaded ?? Promise.resolve();
  }
  const p = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.id = GOOGLE_SCRIPT_ID;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=__dmxGoogleMapsReady`;
    script.async = true;
    (window as unknown as { __dmxGoogleMapsReady?: () => void }).__dmxGoogleMapsReady = () => resolve();
    script.onerror = () => reject(new Error("Google Maps script failed to load"));
    document.head.appendChild(script);
  });
  (window as unknown as { __googleMapsLoaded?: Promise<void> }).__googleMapsLoaded = p;
  return p;
}

export function StructuredAddressField({
  label,
  value,
  onChange,
  namePrefix,
  showMapPreview = true,
  required = true,
  suggestedHub = null,
  onHubSuggest,
}: StructuredAddressFieldProps) {
  const streetInputRef = useRef<HTMLInputElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const valueRef = useRef(value);
  valueRef.current = value;
  const [autocompleteReady, setAutocompleteReady] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const mapInstanceRef = useRef<unknown>(null);
  const markerRef = useRef<unknown>(null);

  const apiKey = typeof process !== "undefined" ? process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY : undefined;

  // Load Google script and init Places Autocomplete
  useEffect(() => {
    if (!apiKey || !streetInputRef.current) return;
    loadGoogleScript(apiKey)
      .then(() => {
        const g = (window as unknown as { google?: { maps: { places: { Autocomplete: new (input: HTMLInputElement, opts: object) => { getPlace: () => { address_components?: { types: string[]; long_name: string }[]; geometry?: { location: { lat: () => number; lng: () => number } }; formatted_address?: string }; addListener: (event: string, fn: () => void) => void } } } } }).google;
        if (!g?.maps?.places?.Autocomplete || !streetInputRef.current) return;
        const autocomplete = new g.maps.places.Autocomplete(streetInputRef.current, {
          componentRestrictions: { country: "ng" },
          fields: ["address_components", "geometry", "formatted_address"],
          types: ["address"],
        });
        autocomplete.addListener("place_changed", () => {
          const place = autocomplete.getPlace();
          const components = place.address_components ?? [];
          let street = "";
          let lga = "";
          let state = "";
          for (const c of components) {
            if (c.types.includes("street_number")) street = (street + " " + c.long_name).trim();
            if (c.types.includes("route")) street = (street + " " + c.long_name).trim();
            if (c.types.includes("sublocality") || c.types.includes("sublocality_level_1")) lga = c.long_name;
            if (c.types.includes("administrative_area_level_2") && !lga) lga = c.long_name;
            if (c.types.includes("administrative_area_level_1")) state = c.long_name;
          }
          if (!street && place.formatted_address) street = place.formatted_address;
          const lat = place.geometry?.location?.lat();
          const lng = place.geometry?.location?.lng();
          const current = valueRef.current;
          const next: StructuredAddressValue = {
            ...current,
            streetAddress: street,
            lga: lga || current.lga,
            state: state || current.state,
            lat: lat ?? current.lat,
            lng: lng ?? current.lng,
          };
          onChange(next);
          const hub = getHubFromAddress(next.lga, next.state);
          onHubSuggest?.(hub);
        });
        setAutocompleteReady(true);
      })
      .catch(() => setAutocompleteReady(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- init once when apiKey/ref available; callbacks read from valueRef
  }, [apiKey]);

  // Map preview: init when we have lat/lng and container
  useEffect(() => {
    const g = typeof window !== "undefined" ? (window as unknown as { google?: { maps: { Map: new (el: HTMLElement, o: object) => { setCenter: (c: { lat: number; lng: number }) => void }; Marker: new (o: object) => { setMap: (m: null) => void; setPosition: (p: { lat: number; lng: number }) => void }; SymbolPath: { CIRCLE: unknown } } } }).google : undefined;
    if (!showMapPreview || !apiKey || !mapRef.current || value.lat == null || value.lng == null) {
      const m = markerRef.current as { setMap: (n: null) => void } | null;
      if (m?.setMap) m.setMap(null);
      markerRef.current = null;
      return;
    }
    if (!g?.maps) return;

    if (!mapInstanceRef.current) {
      mapInstanceRef.current = new g.maps.Map(mapRef.current, {
        center: { lat: value.lat, lng: value.lng },
        zoom: 15,
        disableDefaultUI: true,
        zoomControl: true,
        styles: [
          { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
          { featureType: "transit", elementType: "labels", stylers: [{ visibility: "off" }] },
        ],
      });
      setMapReady(true);
    }
    const map = mapInstanceRef.current as { setCenter: (c: { lat: number; lng: number }) => void };
    map.setCenter({ lat: value.lat, lng: value.lng });

    const marker = markerRef.current as { setPosition: (p: { lat: number; lng: number }) => void } | null;
    if (!marker) {
      markerRef.current = new g.maps.Marker({
        map: mapInstanceRef.current,
        position: { lat: value.lat, lng: value.lng },
        icon: {
          path: g.maps.SymbolPath.CIRCLE,
          scale: 12,
          fillColor: "#5e1914",
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 2,
        },
      });
    } else {
      marker.setPosition({ lat: value.lat, lng: value.lng });
    }
  }, [apiKey, showMapPreview, value.lat, value.lng]);

  const lgaOptions = value.state && LGA_BY_STATE[value.state]
    ? LGA_BY_STATE[value.state]
    : ALL_LGAS;

  const hubSuggestion = getHubFromAddress(value.lga, value.state);
  const displayHub = suggestedHub ?? hubSuggestion;

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <div className="min-w-0 flex-1 space-y-4">
        <h3 className="text-xs font-medium uppercase tracking-wider text-zinc-500 font-sans">
          {label}
        </h3>

        <div>
          <label htmlFor={`${namePrefix}-street`} className="block text-xs font-medium text-zinc-600 font-sans">
            Street Address
          </label>
          <input
            ref={streetInputRef}
            id={`${namePrefix}-street`}
            name={`${namePrefix}StreetAddress`}
            type="text"
            value={value.streetAddress}
            onChange={(e) => onChange({ ...value, streetAddress: e.target.value })}
            placeholder={autocompleteReady ? "Start typing for suggestions..." : "e.g. 12 Admiralty Way, Lekki"}
            required={required}
            className="mt-2 w-full rounded-none border border-zinc-200 bg-white px-4 py-3 font-sans text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-[#5e1914] focus:outline-none focus:ring-1 focus:ring-[#5e1914]"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor={`${namePrefix}-lga`} className="block text-xs font-medium text-zinc-600 font-sans">
              LGA / Area
            </label>
            <select
              id={`${namePrefix}-lga`}
              name={`${namePrefix}Lga`}
              value={value.lga}
              onChange={(e) => {
                const next = { ...value, lga: e.target.value };
                onChange(next);
                onHubSuggest?.(getHubFromAddress(next.lga, next.state));
              }}
              className="mt-2 w-full rounded-none border border-zinc-200 bg-white px-4 py-3 font-sans text-sm text-zinc-900 focus:border-[#5e1914] focus:outline-none focus:ring-1 focus:ring-[#5e1914]"
            >
              <option value="">Select LGA / Area</option>
              {lgaOptions.map((lga) => (
                <option key={lga} value={lga}>{lga}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor={`${namePrefix}-state`} className="block text-xs font-medium text-zinc-600 font-sans">
              State
            </label>
            <select
              id={`${namePrefix}-state`}
              name={`${namePrefix}State`}
              value={value.state}
              onChange={(e) => {
                const next = { ...value, state: e.target.value, lga: "" };
                onChange(next);
                onHubSuggest?.(getHubFromAddress(next.lga, next.state));
              }}
              className="mt-2 w-full rounded-none border border-zinc-200 bg-white px-4 py-3 font-sans text-sm text-zinc-900 focus:border-[#5e1914] focus:outline-none focus:ring-1 focus:ring-[#5e1914]"
            >
              <option value="">Select State</option>
              {ADDRESS_STATES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor={`${namePrefix}-apartment`} className="block text-xs font-medium text-zinc-600 font-sans">
              Apartment / Suite <span className="text-zinc-400">(optional)</span>
            </label>
            <input
              id={`${namePrefix}-apartment`}
              name={`${namePrefix}Apartment`}
              type="text"
              value={value.apartment}
              onChange={(e) => onChange({ ...value, apartment: e.target.value })}
              placeholder="e.g. Suite 4B"
              className="mt-2 w-full rounded-none border border-zinc-200 bg-white px-4 py-3 font-sans text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-[#5e1914] focus:outline-none focus:ring-1 focus:ring-[#5e1914]"
            />
          </div>
          <div>
            <label htmlFor={`${namePrefix}-landmark`} className="block text-xs font-medium text-zinc-600 font-sans">
              Landmark <span className="text-zinc-400">(for rider)</span>
            </label>
            <input
              id={`${namePrefix}-landmark`}
              name={`${namePrefix}Landmark`}
              type="text"
              value={value.landmark}
              onChange={(e) => onChange({ ...value, landmark: e.target.value })}
              placeholder="e.g. Opposite GTBank"
              className="mt-2 w-full rounded-none border border-zinc-200 bg-white px-4 py-3 font-sans text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-[#5e1914] focus:outline-none focus:ring-1 focus:ring-[#5e1914]"
            />
          </div>
        </div>

        {displayHub && (
          <p className="text-xs text-zinc-500 font-sans">
            Smart Hub: <span className="font-medium text-[#5e1914]">{displayHub}</span>
          </p>
        )}
      </div>

      {showMapPreview && (
        <div className="w-full shrink-0 rounded-none border border-zinc-100 bg-white lg:w-80">
          <header className="flex items-center gap-3 border-b border-zinc-100 px-4 py-3">
            <div className="relative h-8 w-8 shrink-0 overflow-hidden bg-white">
              <Image src="/dmxlogo.png" alt="DMX" fill className="object-contain" sizes="32px" />
            </div>
            <span className="text-xs font-medium uppercase tracking-wider text-zinc-500 font-sans">
              Map
            </span>
          </header>
          <div className="relative h-56 w-full">
            <div ref={mapRef} className="absolute inset-0 h-full w-full bg-zinc-100" aria-hidden />
            {value.lat == null || value.lng == null ? (
              <div className="absolute inset-0 flex items-center justify-center bg-zinc-50 text-center text-xs text-zinc-400 font-sans">
                Select an address to see map
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
