import GeocodeCache from "../models/GeocodeCache.js";

const MIN_INTERVAL_MS = 1100; // Nominatim usage policy: max ~1 request/sec
let lastCallAt = 0;
let chain = Promise.resolve();

function serialize(task) {
  const run = chain.then(task, task);
  chain = run.catch(() => {});
  return run;
}

async function fetchFromNominatim(text) {
  return serialize(async () => {
    const wait = Math.max(0, lastCallAt + MIN_INTERVAL_MS - Date.now());
    if (wait > 0) await new Promise((resolve) => setTimeout(resolve, wait));
    lastCallAt = Date.now();

    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(text)}`;
      const res = await fetch(url, { headers: { "User-Agent": "Threadline/1.0 (personal networking app)" } });
      if (!res.ok) return null;

      const results = await res.json();
      if (!results.length) return null;

      return { lat: parseFloat(results[0].lat), lng: parseFloat(results[0].lon), displayName: results[0].display_name };
    } catch (err) {
      console.error("Geocoding request failed:", err.message);
      return null;
    }
  });
}

export async function geocode(text) {
  if (!text || !text.trim()) return null;
  const normalized = text.trim().toLowerCase();

  const cached = await GeocodeCache.findOne({ queryText: normalized });
  if (cached) {
    return cached.lat != null ? { lat: cached.lat, lng: cached.lng, displayName: cached.resolvedDisplayName } : null;
  }

  const result = await fetchFromNominatim(text.trim());

  await GeocodeCache.create({
    queryText: normalized,
    lat: result?.lat,
    lng: result?.lng,
    resolvedDisplayName: result?.displayName,
  });

  return result;
}
