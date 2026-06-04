// Interactive world map of events with clickable navy/lime dots.
// Ported from opencolin/nebius-builders' EventsMap, with two changes:
//   - Reads our event shape: location is a GeoJSON Point ({type, coordinates: [lng, lat]})
//     rather than the upstream's flat {lat, lng} fields.
//   - When `onCityClick` is provided, dot clicks fire it (filters the list
//     above) instead of opening the popup. The active dot renders larger
//     with the lime/navy colors swapped for an unmissable selected state.
//
// Lifecycle: the map is created ONCE per variant change. Marker re-renders
// (events / activeCity prop changes) happen on a separate effect that
// touches only the marker layer — the tile layer stays put, so clicking a
// city pin no longer triggers a full re-tile from the basemap CDN.

import {useEffect, useRef, useState} from 'react';

import type * as L from 'leaflet';

import styles from './EventsMap.module.scss';

export interface MapEvent {
  id: string;
  title: string;
  format: string;
  city: string;
  starts_at: string;
  builder_handle?: string | null;
  location?: {type: 'Point'; coordinates: [number, number]} | null;
}

export interface EventsMapProps {
  events: MapEvent[];
  /**
   * Called with the city name when a dot is clicked. When provided, dot
   * clicks filter the events list (no popup opens). Pass undefined for
   * read-only maps where popups are the primary affordance.
   */
  onCityClick?: (city: string) => void;
  /** Currently selected city — that dot renders highlighted. */
  activeCity?: string | null;
  /**
   * Tile variant. 'light' uses CARTO light_all, 'dark' uses CARTO dark_all.
   * Default 'light'. The 'dark' variant pairs with the events-page hero so
   * the map sits as a dark background behind the title.
   */
  variant?: 'light' | 'dark';
}

// Leaflet types come from `import type * as L from 'leaflet'` above; only used
// for typing the refs that hold the dynamically-imported namespace + objects.
type LeafletNS = typeof L;
type LeafletMap = L.Map;
type LeafletLayerGroup = L.LayerGroup;

const DOT_HTML_DEFAULT =
  '<span style="display:block;width:14px;height:14px;border-radius:50%;background:#052b42;border:2px solid #e0ff4f;box-shadow:0 0 0 4px rgba(224,255,79,0.35);cursor:pointer;"></span>';
const DOT_HTML_ACTIVE =
  '<span style="display:block;width:18px;height:18px;border-radius:50%;background:#e0ff4f;border:3px solid #052b42;box-shadow:0 0 0 6px rgba(224,255,79,0.55);cursor:pointer;"></span>';

export default function EventsMap({events, onCityClick, activeCity, variant = 'light'}: EventsMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<LeafletMap | null>(null);
  const leafletRef = useRef<LeafletNS | null>(null);
  const markerLayerRef = useRef<LeafletLayerGroup | null>(null);
  // Keep the click callback in a ref so changes don't tear the map down.
  const onCityClickRef = useRef(onCityClick);
  useEffect(() => {
    onCityClickRef.current = onCityClick;
  });

  // Track previous events array by reference so we only fitBounds when the
  // events data actually changes — not on every activeCity flip. Reset to
  // null whenever the map is recreated (Effect 1 cleanup) so the next
  // marker pass re-frames from scratch.
  const prevEventsRef = useRef<MapEvent[] | null>(null);

  // mapEpoch bumps every time we successfully create a new map instance.
  // The marker-render effect depends on it so it re-runs once async init
  // finishes (since Effect 1's loadAndInit is async, Effect 2 would
  // otherwise miss the map on first mount).
  const [mapEpoch, setMapEpoch] = useState(0);

  // Effect 1: create the map + tile layer. Re-runs only when `variant`
  // changes, because that's the only prop that requires swapping basemaps.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    let cancelled = false;

    async function loadAndInit() {
      const L = (await import('leaflet')).default as LeafletNS;
      if (cancelled || !mapRef.current) return;

      leafletRef.current = L;

      const map = L.map(mapRef.current, {
        // Initial framing — dialed in from zoom 2 → 3 and centered slightly
        // further north so the typical event spread (US west coast ↔ EU ↔
        // Bengaluru) fills the frame instead of getting lost in the ocean.
        // fitBounds in the marker effect tightens this further once pins
        // are drawn.
        center: [35, 15],
        zoom: 3,
        // Hide the +/- zoom buttons in the dark/hero variant so the title
        // overlay isn't cluttered. Light variant keeps them for the
        // standalone map use case.
        zoomControl: variant === 'light',
        scrollWheelZoom: false,
        worldCopyJump: true,
      });
      mapInstanceRef.current = map;

      // dark variant uses NASA VIIRS City Lights — same satellite-from-space
      // tiles the homepage hero map uses (HeroEventsMap.tsx). Max zoom 8.
      // light variant uses CARTO light_all (high-zoom street basemap) for any
      // standalone map use case.
      if (variant === 'dark') {
        L.tileLayer(
          'https://map1.vis.earthdata.nasa.gov/wmts-webmerc/VIIRS_CityLights_2012/default/GoogleMapsCompatible_Level8/{z}/{y}/{x}.jpg',
          {maxZoom: 8, maxNativeZoom: 8},
        ).addTo(map);
      } else {
        L.tileLayer(
          'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
          {
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
            maxZoom: 18,
            subdomains: 'abcd',
          },
        ).addTo(map);
      }

      // Dedicated layer group so we can clearLayers() on marker updates
      // without disturbing the tile layer underneath.
      markerLayerRef.current = L.layerGroup().addTo(map);

      // Signal Effect 2 to render initial markers.
      setMapEpoch((n) => n + 1);
    }

    loadAndInit();
    return () => {
      cancelled = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      markerLayerRef.current = null;
      leafletRef.current = null;
      // Reset events tracking so the next map's first marker pass re-frames
      // (fitBounds) from scratch instead of skipping it because the events
      // ref hasn't changed since the previous map.
      prevEventsRef.current = null;
    };
  }, [variant]);

  // Effect 2: render markers + fitBounds whenever events / activeCity
  // change. Touches only the marker layer — no tile reload, no map
  // teardown. The mapEpoch dep makes this re-run after Effect 1 finishes
  // its async init on mount/variant change.
  useEffect(() => {
    const L = leafletRef.current;
    const map = mapInstanceRef.current;
    const layer = markerLayerRef.current;
    if (!L || !map || !layer) return;

    layer.clearLayers();

    const makeIcon = (active: boolean) =>
      L.divIcon({
        className: 'nb-event-dot',
        html: active ? DOT_HTML_ACTIVE : DOT_HTML_DEFAULT,
        iconSize: active ? [18, 18] : [14, 14],
        iconAnchor: active ? [9, 9] : [7, 7],
      });

    const markerCoords: Array<[number, number]> = [];

    events
      .filter((e) => e.location?.coordinates?.length === 2)
      .forEach((e) => {
        const [lng, lat] = e.location!.coordinates;
        markerCoords.push([lat, lng]);
        const isActive = activeCity === e.city;
        const marker = L.marker([lat, lng], {icon: makeIcon(isActive)});

        // Bind a popup as a fallback affordance (used when no callback is wired).
        const date = new Date(e.starts_at).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        });
        const handle = e.builder_handle ? `@${e.builder_handle}` : 'Nebius';
        marker.bindPopup(`
          <div style="font-family:Inter,sans-serif;min-width:220px;">
            <div style="font-size:10px;letter-spacing:0.08em;text-transform:uppercase;color:rgba(5,43,66,0.55);font-family:'Menlo',monospace;">${e.format} · ${e.city}</div>
            <div style="font-weight:600;color:#052b42;margin:4px 0 6px;line-height:1.2;">${escapeHtml(e.title)}</div>
            <div style="font-size:12px;color:rgba(5,43,66,0.7);">${date} · ${handle}</div>
          </div>
        `);

        marker.on('click', () => {
          const cb = onCityClickRef.current;
          if (cb) {
            // If callback is wired, suppress the popup and just filter
            marker.closePopup();
            cb(e.city);
          }
          // Otherwise let Leaflet open the popup (its default behavior)
        });

        layer.addLayer(marker);
      });

    // Auto-fit to actual events ONLY when the events array changes —
    // not on activeCity flips. Otherwise the map would pan/zoom on every
    // city click, which combined with the marker rebuild felt like a full
    // map reset to users. Capped at zoom 5 so a single event doesn't slam
    // to street level. Padding leaves the title overlay and the city-chip
    // strip room without covering pins.
    const eventsChanged = prevEventsRef.current !== events;
    prevEventsRef.current = events;
    if (eventsChanged && markerCoords.length > 0) {
      map.fitBounds(L.latLngBounds(markerCoords), {
        padding: [60, 60],
        maxZoom: 5,
        animate: false,
      });
    }
  }, [events, activeCity, mapEpoch]);

  const className =
    variant === 'dark' ? `${styles.map} ${styles.fullBleed}` : styles.map;
  return <div ref={mapRef} className={className} />;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
