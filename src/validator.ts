export interface ValidationResult {
  fileName: string;
  extension: string;
  actualType: string;
  isValid: boolean;
}

/**
 * Get extension from file name
 */
function getFileExtension(fileName: string): string {
  return fileName.split(".").pop()?.toLowerCase() || "";
}

/**
 * Detect content type from magic number
 */
function getContentTypeFromBuffer(buffer: Buffer): string {
  const hex = buffer.toString("hex", 0, 12).toUpperCase();
  const ascii = buffer.toString("ascii", 8, 12);

  if (hex.startsWith("FFD8FF")) return "jpg";
  if (hex.startsWith("89504E47")) return "png";
  if (hex.startsWith("25504446")) return "pdf";
  if (hex.startsWith("D0CF11E0")) return "doc"; // Could be .xls too
  if (hex.startsWith("504B0304")) return "zip-based"; // docx, xlsx, pptx
  if (hex.startsWith("52617221")) return "rar";
  if (hex.startsWith("1F8B08")) return "gz";
  if (hex.startsWith("424D")) return "bmp";
  if (hex.startsWith("47494638")) return "gif";
  if (hex.startsWith("00000100") || hex.startsWith("00000200")) return "ico";
  if (hex.startsWith("00000018") || hex.startsWith("00000020")) return "mp4";

  // WebP: starts with RIFF....WEBP
  if (hex.startsWith("52494646") && ascii === "WEBP") return "webp";

  // HEIC/HEIF: ftypheic / ftypheix / ftypmif1 / ftypmsf1
  if (buffer.toString("ascii", 4, 12).includes("ftyp")) {
    const ftyp = buffer.toString("ascii", 8, 12);
    if (["heic", "heix", "mif1", "msf1"].includes(ftyp)) return "heic";
  }

  // Plain text fallback (utf-8 printable range)
  const sample = buffer.toString("utf8", 0, 512);
  if (/^[\x20-\x7E\r\n\t]+$/.test(sample)) return "txt";

  return "unknown";
}

/**
 * Check ZIP-based Office document types
 */
function checkZipBasedFormat(buffer: Buffer): string {
  const content = buffer.toString();

  if (content.includes("[Content_Types].xml")) {
    if (content.includes("word/document.xml")) return "docx";
    if (content.includes("xl/workbook.xml")) return "xlsx";
    if (content.includes("ppt/presentation.xml")) return "pptx";
  }

  return "zip";
}

/**
 * Final validation logic
 */
export function validateFileBuffer(
  buffer: Buffer,
  originalName: string
): ValidationResult {
  const extension = getFileExtension(originalName);
  let actualType = getContentTypeFromBuffer(buffer);

  if (actualType === "zip-based") {
    actualType = checkZipBasedFormat(buffer);
  }

  return {
    fileName: originalName,
    extension,
    actualType,
    isValid: extension === actualType,
  };
}
