// =====================================================================
// components/MapPicker.tsx
// Interactive map with draggable pin and reverse geocoding
// =====================================================================

'use client';

import { useState, useRef, useEffect } from 'react';
import { MapPin, Loader2 } from 'lucide-react';
import { useCallback } from 'react';

interface MapPickerProps {
  latitude: number | null;
  longitude: number | null;
  wardLabel: string;
  onLocationSelect: (
    lat: number,
    lng: number,
    wardId: string,
    wardLabel: string
  ) => void;
  language: 'en' | 'np';
  disabled?: boolean;
}

export function MapPicker({
  latitude,
  longitude,
  wardLabel,
  onLocationSelect,
  language,
  disabled = false,
}: MapPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [map, setMap] = useState<any>(null);
  const [marker, setMarker] = useState<any>(null);
  const defaultLat = latitude || 28.2096;
  const defaultLng = longitude || 83.9856; // Pokhara coords

  useEffect(() => {
    if (!mapRef.current || map) return;

    // Initialize map using OpenStreetMap
    const L = require('leaflet');
    require('leaflet/dist/leaflet.css');

    const newMap = L.map(mapRef.current).setView([defaultLat, defaultLng], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(newMap);

    // Create draggable marker
    const newMarker = L.marker([defaultLat, defaultLng], {
      draggable: true,
    }).addTo(newMap);

    newMarker.on('dragend', async () => {
      const pos = newMarker.getLatLng();
      await matchWard(pos.lat, pos.lng);
    });

    setMap(newMap);
    setMarker(newMarker);

    return () => {
      newMap.remove();
    };
  }, []);

  const matchWard = useCallback(
    async (lat: number, lng: number) => {
      setLoading(true);
      try {
        const { data, error } = await supabase.rpc(
          'match_point_to_ward',
          { lat, lng }
        );

        if (error) throw error;

        if (data && data[0]) {
          const ward = data[0];
          onLocationSelect(
            lat,
            lng,
            ward.ward_id,
            `Ward ${ward.ward_number} – ${
              language === 'en'
                ? ward.ward_name
                : ward.ward_name_nepali || ward.ward_name
            }`
          );
        }
      } catch (err) {
        console.error('Ward matching failed:', err);
      } finally {
        setLoading(false);
      }
    },
    [language, onLocationSelect]
  );

  return (
    <div className="space-y-3">
      <div
        ref={mapRef}
        className="w-full h-64 rounded-lg border border-slate-700 bg-slate-800"
      />

      {wardLabel && (
        <div className="flex items-center gap-2 text-sm text-emerald-400">
          <MapPin className="w-4 h-4" />
          <span>{wardLabel}</span>
          {loading && <Loader2 className="w-3 h-3 animate-spin" />}
        </div>
      )}

      <p className="text-xs text-slate-400">
        {language === 'en'
          ? 'Drag the pin to select your location'
          : 'आफ्नो स्थान छान्न पिन ड्र्याग गर्नुहोस्'}
      </p>
    </div>
  );
}

