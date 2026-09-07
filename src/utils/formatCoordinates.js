export function getGPSCoordinates(metadata = {}) {
  const latitude =
    metadata.latitude ??
    metadata.Latitude ??
    metadata.GPSLatitude;

  const longitude =
    metadata.longitude ??
    metadata.Longitude ??
    metadata.GPSLongitude;

  if (
    latitude === undefined ||
    longitude === undefined ||
    latitude === null ||
    longitude === null
  ) {
    return null;
  }

  const lat = Number(latitude);
  const lon = Number(longitude);

  if (
    !Number.isFinite(lat) ||
    !Number.isFinite(lon)
  ) {
    return null;
  }

  if (
    lat < -90 ||
    lat > 90 ||
    lon < -180 ||
    lon > 180
  ) {
    return null;
  }

  return {
    latitude: lat,
    longitude: lon,
  };
}

export function formatLatitude(latitude) {
  if (!Number.isFinite(Number(latitude))) {
    return "Unknown";
  }

  const direction =
    Number(latitude) >= 0 ? "N" : "S";

  return `${Math.abs(Number(latitude)).toFixed(
    6
  )}° ${direction}`;
}

export function formatLongitude(longitude) {
  if (!Number.isFinite(Number(longitude))) {
    return "Unknown";
  }

  const direction =
    Number(longitude) >= 0 ? "E" : "W";

  return `${Math.abs(Number(longitude)).toFixed(
    6
  )}° ${direction}`;
}

export function formatDecimalCoordinates(
  latitude,
  longitude
) {
  if (
    !Number.isFinite(Number(latitude)) ||
    !Number.isFinite(Number(longitude))
  ) {
    return "Unknown";
  }

  return `${Number(latitude).toFixed(
    6
  )}, ${Number(longitude).toFixed(6)}`;
}

export function createMapURL(
  latitude,
  longitude
) {
  if (
    !Number.isFinite(Number(latitude)) ||
    !Number.isFinite(Number(longitude))
  ) {
    return null;
  }

  const query = encodeURIComponent(
    `${latitude},${longitude}`
  );

  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}