import { getBasicFileInfo } from "../services/fileService";
import { calculateSHA256 } from "../services/hashService";

export async function parseGenericFile(file) {
  const fileInfo = getBasicFileInfo(file);

  const sha256 = await calculateSHA256(file);

  return {
    file: fileInfo,

    hash: {
      algorithm: "SHA-256",
      value: sha256,
    },

    metadata: {},
  };
}