'use client';

import { useEffect, useRef } from 'react';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

interface Props {
  lat: number | null;
  lng: number | null;
  name: string;
}

export function BarProfileClient({ lat, lng, name }: Props) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current || mapRef.current || !lat || !lng || !MAPBOX_TOKEN) return;

    const loadMap = async () => {
      if (!document.querySelector('link[href*="mapbox-gl"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://api.mapbox.com/mapbox-gl-js/v3.3.0/mapbox-gl.css';
        document.head.appendChild(link);
      }
      const mapboxgl = (await import('mapbox-gl')).default;
      mapboxgl.accessToken = MAPBOX_TOKEN;

      const map = new mapboxgl.Map({
        container: mapContainer.current!,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: [lng, lat],
        zoom: 14,
        attributionControl: false,
        interactive: true,
      });

      map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right');

      // Custom marker
      const el = document.createElement('div');
      el.style.cssText = `
        width: 24px; height: 24px; border-radius: 50%;
        background: #7B1E1E; border: 3px solid #f5f0eb;
        box-shadow: 0 2px 8px rgba(0,0,0,0.4);
      `;

      new mapboxgl.Marker({ element: el })
        .setLngLat([lng, lat])
        .addTo(map);

      // Ensure map fills container after render
      map.on('load', () => {
        map.resize();
      });

      mapRef.current = map;
    };

    loadMap();
    return () => { mapRef.current?.remove(); mapRef.current = null; };
  }, [lat, lng, name]);

  if (!lat || !lng) {
    return (
      <div className="bar-v2-map-placeholder">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
        </svg>
        <span>Map not available</span>
      </div>
    );
  }

  return <div ref={mapContainer} className="bar-v2-map" />;
}
