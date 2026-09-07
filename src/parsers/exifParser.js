import exifr from "exifr";

export async function parseExif(file) {
  try {
    const metadata = await exifr.parse(file, {
      tiff: true,
      ifd0: true,
      exif: true,
      gps: true,
      interop: true,
      xmp: true,
      iptc: true,
      icc: false,
      translateValues: true,
      translateKeys: true,
    });

    return metadata || {};
  } catch (error) {
    console.error("EXIF parsing failed:", error);

    return {};
  }
}