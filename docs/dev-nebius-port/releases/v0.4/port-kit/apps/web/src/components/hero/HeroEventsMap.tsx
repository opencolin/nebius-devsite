// Slowly-panning world map with breathing lime dots at every event location.
// Ported from opencolin/nebius-builders' HeroEventsMap. Uses NASA's VIIRS
// City Lights tiles for the dark satellite-from-space aesthetic.
//
// Differences from upstream:
//   - Reads our event shape: location is a GeoJSON Point ({type, coordinates: [lng, lat]})
//     rather than the upstream's flat {lat, lng} fields.
//   - Loaded via next/dynamic with ssr: false in pages/index.tsx — Leaflet
//     touches `window` and refuses to import server-side.
//
// CSS for the breathing dots lives in src/styles/globals.scss under the
// `.nb-hero-*` selectors so we don't fight the CSS Modules scope.

import {useEffect, useRef} from 'react';

export interface HeroEvent {
  id: string;
  title: string;
  /** GeoJSON Point — Directus stores [lng, lat] in this order. */
  location?: {type: 'Point'; coordinates: [number, number]} | null;
}

export interface HeroEventsMapProps {
  events: HeroEvent[];
}

export default function HeroEventsMap({events}: HeroEventsMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  // Type as `unknown` — the Leaflet types we'd need (`L.Map`) live in a
  // dynamically-imported module and aren't worth pulling into the static
  // type graph here.
  const mapInstanceRef = useRef<{remove(): void; panBy(p: [number, number], o: object): void; getCenter(): {lat: number; lng: number}; setView(c: [number, number], z: number, o: object): void; getZoom(): number} | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    let cancelled = false;
    let rotationInterval: ReturnType<typeof setInterval> | null = null;

    async function loadAndInit() {
      const L = (await import('leaflet')).default;
      if (cancelled || !mapRef.current) return;

      // Tear down any prior instance attached to this DOM node
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const map = L.map(mapRef.current, {
        center: [22, 5],
        zoom: 2,
        zoomControl: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        boxZoom: false,
        dragging: false,
        touchZoom: false,
        keyboard: false,
        attributionControl: false,
        worldCopyJump: true,
      });
      mapInstanceRef.current = map;

      // NASA VIIRS City Lights — same tile clawcamp uses for the
      // satellite-from-space, lights-of-cities aesthetic.
      L.tileLayer(
        'https://map1.vis.earthdata.nasa.gov/wmts-webmerc/VIIRS_CityLights_2012/default/GoogleMapsCompatible_Level8/{z}/{y}/{x}.jpg',
        {maxZoom: 8, maxNativeZoom: 8},
      ).addTo(map);

      // Drop one dot per event at THREE longitudes: original, +360, -360.
      // The map pans east indefinitely (resets at lng>540 → lng-360), so
      // the visible viewport sweeps across multiple world copies. Without
      // these duplicates, dots disappear from view after one full rotation
      // and don't come back until the next reset.
      events
        .filter((e) => e.location?.coordinates?.length === 2)
        .forEach((e, i) => {
          const [lng, lat] = e.location!.coordinates;
          const delay = ((i * 0.4) % 3).toFixed(2);
          const dotIcon = L.divIcon({
            className: 'nb-hero-dot',
            html: `<span class="nb-hero-dot-pulse" style="--nb-dot-delay:${delay}s"></span><span class="nb-hero-dot-ring" style="--nb-dot-delay:${delay}s"></span>`,
            iconSize: [16, 16],
            iconAnchor: [8, 8],
          });
          for (const lngOffset of [-360, 0, 360]) {
            L.marker([lat, lng + lngOffset], {
              icon: dotIcon,
              interactive: false,
              keyboard: false,
            }).addTo(map);
          }
        });

      // Slow eastward rotation — matches the clawcamp pan rhythm.
      // 0.5 px every 50 ms = smooth glide; reset by 360° when we drift.
      rotationInterval = setInterval(() => {
        if (!mapInstanceRef.current) return;
        mapInstanceRef.current.panBy([0.5, 0], {animate: false});
        const center = mapInstanceRef.current.getCenter();
        if (center.lng > 540) {
          mapInstanceRef.current.setView(
            [center.lat, center.lng - 360],
            mapInstanceRef.current.getZoom(),
            {animate: false},
          );
        }
      }, 50);
    }

    loadAndInit();
    return () => {
      cancelled = true;
      if (rotationInterval) clearInterval(rotationInterval);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [events]);

  return <div ref={mapRef} className="nb-hero-map" aria-hidden="true" />;
}
