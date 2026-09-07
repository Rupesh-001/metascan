import { getFileCategory } from "./fileService";
import { parseImage } from "../parsers/imageParser";
import { parseGenericFile } from "../parsers/genericParser";

export async function analyzeFile(file) {
  const category = getFileCategory(file);

  switch (category) {
    case "image":
      return await parseImage(file);

    case "pdf":
      return await parseGenericFile(file);

    case "docx":
      return await parseGenericFile(file);

    default:
      return await parseGenericFile(file);
  }
}