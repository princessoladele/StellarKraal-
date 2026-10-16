/**
 * CollateralLocationSection — Issue #1253
 *
 * Renders a Leaflet map showing the animal's registered GPS location.
 * Falls back to showing the raw location string when coordinates are absent
 * but a location string is provided. Hidden entirely when no location data
 * exists at all.
 *
 * Acceptance criteria:
 *  ✓ Leaflet map rendered when latitude and longitude are present
 *  ✓ Map marker uses the animal type icon
 *  ✓ Map hidden when coordinates are absent
 *  ✓ Map tiles loaded via OpenStreetMap (no API key required)
 *  ✓ Map is keyboard accessible (tabIndex + role="application" on map div)
 */
'use client';

import dynamic from 'next/dynamic';

// Dynamically import so Leaflet (which accesses `window`) is never SSR-rendered.
const LeafletMap = dynamic(() => import('@/components/LeafletMap'), {
  ssr: false,
  loading: () => (
    <div
      role="img"
      aria-label="Map loading…"
      className="w-full h-64 rounded-xl animate-pulse"
      style={{ backgroundColor: 'var(--color-skeleton-base, #e8ddd0)' }}
    />
  ),
});

interface Props {
  /** Optional location description string. Shown when coordinates are absent. */
  location?: string | null;
  /** GPS latitude — map is rendered when both lat and lng are present. */
  latitude?: number | null;
  /** GPS longitude — map is rendered when both lat and lng are present. */
  longitude?: number | null;
  /** Animal type passed to the map marker icon. */
  animalType?: string;
}

export default function CollateralLocationSection({
  location,
  latitude,
  longitude,
  animalType,
}: Props) {
  const hasCoordinates =
    latitude != null && longitude != null && isFinite(latitude) && isFinite(longitude);

  // Hidden entirely when there is no location data of any kind.
  if (!hasCoordinates && !location) return null;

  return (
    <section
      aria-labelledby="location-section-heading"
      className="mt-6 bg-white dark:bg-[var(--color-bg-card)] rounded-2xl p-6 shadow"
    >
      <h2
        id="location-section-heading"
        className="text-lg font-semibold text-brown dark:text-[var(--color-text)] mb-4 flex items-center gap-2"
      >
        <span aria-hidden="true">📍</span>
        Location
      </h2>

      {hasCoordinates ? (
        <>
          <LeafletMap
            latitude={latitude as number}
            longitude={longitude as number}
            animalType={animalType}
          />
          <p
            className="mt-3 text-sm tabular-nums"
            style={{ color: 'var(--color-text-muted, #8B5A1F)' }}
          >
            {(latitude as number).toFixed(6)}, {(longitude as number).toFixed(6)}
          </p>
        </>
      ) : (
        // Coordinates absent but a text location string was provided.
        <p
          className="text-sm"
          style={{ color: 'var(--color-text-muted, #8B5A1F)' }}
        >
          {location}
        </p>
      )}
    </section>
  );
}
