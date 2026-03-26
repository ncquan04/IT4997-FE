export type GeoPoint = {
  lat: number;
  lon: number;
};

const branchGeoCache = new Map<string, GeoPoint>();

export const toRadians = (degree: number) => (degree * Math.PI) / 180;

export const calculateDistanceKm = (from: GeoPoint, to: GeoPoint): number => {
  const earthRadiusKm = 6371;
  const dLat = toRadians(to.lat - from.lat);
  const dLon = toRadians(to.lon - from.lon);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(from.lat)) *
      Math.cos(toRadians(to.lat)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
};

export const getUserCoordinatesByIp = async (): Promise<GeoPoint | null> => {
  try {
    const response = await fetch("https://ipapi.co/json/");
    if (!response.ok) return null;

    const data = await response.json();
    const lat = Number(data?.latitude);
    const lon = Number(data?.longitude);

    if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
    return { lat, lon };
  } catch {
    return null;
  }
};

export const getUserCoordinatesByBrowser =
  async (): Promise<GeoPoint | null> => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      return null;
    }

    return await new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
        },
        () => resolve(null),
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 120000,
        },
      );
    });
  };

export const geocodeAddress = async (
  address: string,
): Promise<GeoPoint | null> => {
  const cacheKey = address.trim().toLowerCase();
  if (!cacheKey) return null;

  if (branchGeoCache.has(cacheKey)) {
    return branchGeoCache.get(cacheKey) ?? null;
  }

  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`;
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) return null;

    const data = (await response.json()) as Array<{ lat: string; lon: string }>;
    const first = data?.[0];
    if (!first) return null;

    const lat = Number(first.lat);
    const lon = Number(first.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;

    const point = { lat, lon };
    branchGeoCache.set(cacheKey, point);
    return point;
  } catch {
    return null;
  }
};

/**
 * Sort branches by distance from userPoint. Returns branchIds in nearest-first order.
 * Branches that cannot be geocoded are placed at the end.
 */
export const sortBranchesByDistance = async (
  branches: Array<{ branchId: string; address: string }>,
  userPoint: GeoPoint,
): Promise<string[]> => {
  const resolved = await Promise.all(
    branches.map(async (branch) => {
      const point = await geocodeAddress(branch.address);
      const distance = point ? calculateDistanceKm(userPoint, point) : Infinity;
      return { branchId: branch.branchId, distance };
    }),
  );

  resolved.sort((a, b) => a.distance - b.distance);
  return resolved.map((r) => r.branchId);
};
