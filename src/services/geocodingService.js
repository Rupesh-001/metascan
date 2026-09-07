const NOMINATIM_URL =
  "https://nominatim.openstreetmap.org/reverse";

let lastLookupAt = 0;

export async function reverseGeocode(
  latitude,
  longitude
) {
  const lat = Number(latitude);
  const lon = Number(longitude);

  if (
    !Number.isFinite(lat) ||
    !Number.isFinite(lon) ||
    lat < -90 ||
    lat > 90 ||
    lon < -180 ||
    lon > 180
  ) {
    throw new Error("Invalid GPS coordinates.");
  }

  // Avoid accidental repeated requests to the public geocoding service.
  const now = Date.now();

  if (now - lastLookupAt < 1000) {
    throw new Error(
      "Please wait a moment before requesting another lookup."
    );
  }

  lastLookupAt = now;

  const params = new URLSearchParams({
    format: "jsonv2",
    lat: String(lat),
    lon: String(lon),
    zoom: "18",
    addressdetails: "1",
    "accept-language":
      navigator.language || "en",
  });

  const response = await fetch(
    `${NOMINATIM_URL}?${params.toString()}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    }
  );

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error(
        "The geocoding service rate-limited this request. Please try again later."
      );
    }

    throw new Error(
      `Geocoding request failed (${response.status}).`
    );
  }

  const data = await response.json();

  if (!data?.display_name) {
    throw new Error(
      "No address could be resolved for these coordinates."
    );
  }

  const address =
    data.address || {};

  return {
    displayName:
      data.display_name,

    city:
      address.city ||
      address.town ||
      address.village ||
      address.municipality ||
      address.county ||
      null,

    state:
      address.state ||
      address.region ||
      null,

    country:
      address.country ||
      null,

    postcode:
      address.postcode ||
      null,

    countryCode:
      address.country_code?.toUpperCase() ||
      null,

    provider:
      "OpenStreetMap Nominatim",
  };
}