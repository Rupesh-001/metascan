// COMPLETE FILE

const normalize = (key = "") =>
  String(key)
    .replace(/^XMP:/i, "")
    .replace(/[_\-\s]/g, "")
    .toLowerCase();

const pick = (metadata, keys) => {
  const entries = Object.entries(metadata || {});
  for (const key of keys) {
    const found = entries.find(
      ([k, v]) =>
        normalize(k) === normalize(key) &&
        v !== undefined &&
        v !== null &&
        v !== ""
    );
    if (found) return found[1];
  }
  return null;
};

const clean = (arr) =>
  arr.filter(
    (i) =>
      i.value !== null &&
      i.value !== undefined &&
      i.value !== ""
  );

export const getCameraMetadata = (m = {}) =>
  clean([
    { label: "Manufacturer", value: pick(m, ["Make"]) },
    { label: "Camera Model", value: pick(m, ["Model"]) },
    { label: "Lens", value: pick(m, ["LensModel", "Lens"]) },
    { label: "Lens Make", value: pick(m, ["LensMake"]) },
    { label: "Serial Number", value: pick(m, ["BodySerialNumber", "SerialNumber"]), sensitive: true },
    { label: "Firmware", value: pick(m, ["FirmwareVersion", "Firmware"]) },
  ]);

export const getExposureMetadata = (m = {}) =>
  clean([
    { label: "ISO", value: pick(m, ["ISO", "ISOSpeedRatings"]) },
    { label: "Shutter", value: pick(m, ["ExposureTime"]) },
    { label: "Aperture", value: pick(m, ["FNumber"]) },
    { label: "Focal Length", value: pick(m, ["FocalLength"]) },
    { label: "Flash", value: pick(m, ["Flash"]) },
    { label: "White Balance", value: pick(m, ["WhiteBalance"]) },
    { label: "Metering", value: pick(m, ["MeteringMode"]) },
  ]);

export const getDateMetadata = (m = {}) =>
  clean([
    { label: "Date Taken", value: pick(m, ["DateTimeOriginal"]), sensitive: true },
    { label: "Created", value: pick(m, ["CreateDate"]) },
    { label: "Modified", value: pick(m, ["ModifyDate"]) },
    { label: "Digitized", value: pick(m, ["DateTimeDigitized"]) },
    { label: "GPS Timestamp", value: pick(m, ["GPSDateTime"]), sensitive: true },
  ]);

export const getLocationMetadata = (m = {}) =>
  clean([
    { label: "Latitude", value: pick(m, ["latitude", "GPSLatitude"]), sensitive: true },
    { label: "Longitude", value: pick(m, ["longitude", "GPSLongitude"]), sensitive: true },
    { label: "Altitude", value: pick(m, ["GPSAltitude"]) },
    { label: "Direction", value: pick(m, ["GPSImgDirection"]) },
  ]);

export const getSoftwareMetadata = (m = {}) =>
  clean([
    { label: "Software", value: pick(m, ["Software"]) },
    { label: "Processing Software", value: pick(m, ["ProcessingSoftware"]) },
    { label: "Host Computer", value: pick(m, ["HostComputer"]) },
  ]);

export const getPersonalMetadata = (m = {}) =>
  clean([
    { label: "Creator", value: pick(m, ["Artist", "Creator", "Author"]), sensitive: true },
    { label: "Copyright", value: pick(m, ["Copyright"]) },
    { label: "Keywords", value: pick(m, ["Keywords"]) },
    { label: "Description", value: pick(m, ["ImageDescription"]) },
  ]);

export const getXMPMetadata = (m = {}) =>
  Object.entries(m)
    .filter(([k]) => k.startsWith("XMP:"))
    .map(([k, v]) => ({
      label: k.replace(/^XMP:/, ""),
      value: String(v),
    }));

export const getOtherMetadata = (m = {}) =>
  Object.entries(m)
    .filter(([k]) => !k.startsWith("XMP:"))
    .map(([k, v]) => ({
      label: k,
      value: String(v),
    }));