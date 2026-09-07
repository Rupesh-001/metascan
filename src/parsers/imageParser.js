import { getBasicFileInfo } from "../services/fileService";
import { calculateSHA256 } from "../services/hashService";
import { parseExif } from "./exifParser";

export async function parseImage(file) {
  const fileInfo = getBasicFileInfo(file);

  const hash = await calculateSHA256(file);

  let metadata = {};

  try {
    metadata = await parseExif(file);
  } catch (error) {
    console.error(
      "Image metadata extraction failed:",
      error
    );
  }

  let dimensions = {};

  try {
    const image = await createImageBitmap(file);

    dimensions = {
      width: image.width,
      height: image.height,
    };

    image.close();
  } catch (error) {
    console.warn(
      "Could not determine image dimensions."
    );
  }

  return {
    file: fileInfo,

    hash: {
      algorithm: "SHA-256",
      value: hash,
    },

    image: {
      dimensions,
    },

    metadata,
  };
}