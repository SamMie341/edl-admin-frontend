'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { MapPin, Check, Crosshair } from 'lucide-react';
import { Button } from '@/components/ui/button';
import 'leaflet/dist/leaflet.css';

// Dynamic import of Map Container to disable SSR
const LeafletMap = dynamic(
  async () => {
    const L = await import('leaflet');
    const { MapContainer, TileLayer, Marker, useMapEvents } = await import(
      'react-leaflet'
    );

    // Fix Leaflet Default Icon path in Next.js
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl:
        'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });

    function MapClickHandler({
      onSelect,
    }: {
      onSelect: (lat: number, lng: number) => void;
    }) {
      useMapEvents({
        click(e) {
          onSelect(e.latlng.lat, e.latlng.lng);
        },
      });
      return null;
    }

    return function MapComponent({
      lat,
      lng,
      onSelect,
    }: {
      lat: number;
      lng: number;
      onSelect: (lat: number, lng: number) => void;
    }) {
      return (
        <MapContainer
          center={[lat, lng]}
          zoom={13}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={[lat, lng]} />
          <MapClickHandler onSelect={onSelect} />
        </MapContainer>
      );
    };
  },
  {
    ssr: false,
    loading: () => (
      <div className="h-64 w-full rounded-2xl bg-slate-100 flex items-center justify-center text-xs text-slate-400">
        ກຳລັງໂຫຼດແຜນທີ່ Leaflet...
      </div>
    ),
  }
);

interface MapCoordinatePickerProps {
  value?: string | null;
  onChange: (coordinates: string) => void;
}

export function MapCoordinatePicker({
  value,
  onChange,
}: MapCoordinatePickerProps) {
  // Default coordinates: Vientiane, Laos (17.9757, 102.6331)
  const defaultLat = 17.9757;
  const defaultLng = 102.6331;

  const [lat, setLat] = useState(defaultLat);
  const [lng, setLng] = useState(defaultLng);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (value) {
      const match = value.match(/(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)/);
      if (match) {
        const pLat = parseFloat(match[1]);
        const pLng = parseFloat(match[2]);
        if (!isNaN(pLat) && !isNaN(pLng)) {
          setLat(pLat);
          setLng(pLng);
        }
      }
    }
  }, [value]);

  const handleSelectCoords = (newLat: number, newLng: number) => {
    const formattedLat = parseFloat(newLat.toFixed(6));
    const formattedLng = parseFloat(newLng.toFixed(6));
    setLat(formattedLat);
    setLng(formattedLng);
    onChange(`${formattedLat}, ${formattedLng}`);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <MapPin className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="17.975700, 102.633100"
            className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50/60 text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500 font-mono"
          />
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={() => setIsOpen(!isOpen)}
          className="h-10 px-3.5 rounded-xl text-xs gap-1.5 border-slate-200 text-slate-700 hover:bg-slate-100 cursor-pointer shrink-0"
        >
          <Crosshair className="h-4 w-4 text-blue-600" />
          <span>{isOpen ? 'ເຊື່ອງແຜນທີ່' : 'ປັກໝຸດເທິງແຜນທີ່'}</span>
        </Button>
      </div>

      {isOpen && (
        <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm p-1 bg-white space-y-2">
          <div className="h-64 w-full rounded-xl overflow-hidden">
            <LeafletMap lat={lat} lng={lng} onSelect={handleSelectCoords} />
          </div>
          <div className="px-3 pb-2 flex items-center justify-between text-[11px] text-slate-500">
            <span>ຄລິກເທິງແຜນທີ່ເພື່ອປັກໝຸດພິກັດທີ່ຕ້ອງການ</span>
            <span className="font-mono font-semibold text-blue-600">
              {lat.toFixed(6)}, {lng.toFixed(6)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
