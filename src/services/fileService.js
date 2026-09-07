export function getFileCategory(file) {
  const type = file.type?.toLowerCase() || "";
  const name = file.name.toLowerCase();

  if (
    type.startsWith("image/") ||
    /\.(jpg|jpeg|png|webp|heic|heif|avif|tif|tiff)$/i.test(name)
  ) {
    return "image";
  }

  if (
    type === "application/pdf" ||
    name.endsWith(".pdf")
  ) {
    return "pdf";
  }

  if (
    type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    name.endsWith(".docx")
  ) {
    return "docx";
  }

  return "generic";
}

export function getFileExtension(filename) {
  const parts = filename.split(".");

  if (parts.length < 2) {
    return "";
  }

  return parts.pop().toUpperCase();
}

export function getBasicFileInfo(file) {
  return {
    name: file.name,
    size: file.size,
    type: file.type || "Unknown",
    extension: getFileExtension(file.name),
    lastModified: file.lastModified,
    lastModifiedDate: new Date(file.lastModified),
    category: getFileCategory(file),
  };
}