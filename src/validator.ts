/**
 * Validate whether the uploaded file's actual content type
 * matches its file extension using magic number detection.
 */

export interface ValidationResult {
  fileName: string;
  extension: string;
  actualType: string;
  isValid: boolean;
}

const extensionAliases: Record<string, string[]> = {
  // 🧾 Text-based formats (no unique signature)
  csv: ["txt"],
  tsv: ["txt"],
  log: ["txt"],
  json: ["txt"],
  psql: ["txt"],
  sql: ["txt"],
  rtf: ["txt"],
  xml: ["txt"],
  md: ["txt"],
  sh: ["txt"],
  html: ["txt"],
  css: ["txt"],
  yml: ["txt"],
  yaml: ["txt"],
  patch: ["txt"],
  diff: ["txt"],
  tex: ["txt"],
  ps: ["txt"],
  php: ["txt"],
  js: ["txt"],
  ts: ["txt"],

  // Image formats
  jpg: ["jpeg"],
  jpeg: ["jpg"],
  jfif: ["jpg"],
  tiff: ["tif"],
  tif: ["tiff"],

  // 📊 Microsoft Office binary formats
  xls: ["doc"],
  ppt: ["doc"],
  wps: ["doc"],
  dot: ["doc"],
  dotx: ["docx"],
  pps: ["doc"],
  ppsx: ["pptx"],
  xlt: ["doc"], // legacy Excel template (same as .xls)
  xlsm: ["xlsx"], // macro-enabled workbook
  xltx: ["xlsx"], // modern template
  xltm: ["xlsx"], // macro-enabled template

  // 📄 Apple & Open formats (may be read as zip/plain)
  numbers: ["zip", "txt"],
  pages: ["zip", "txt"],
  key: ["zip", "txt"],
  odt: ["zip"],
  ods: ["zip"],
  odp: ["zip"],

  // 🖼️ HEIC and related image types
  heif: ["heic"],
  heic: ["heif"],

  // 🧳 Compressed archives (some formats overlap)
  apk: ["zip"],
  jar: ["zip"],
  docx: ["zip"],
  xlsx: ["zip"],
  pptx: ["zip"],
  epub: ["zip"],

  // Audio formats
  m4a: ["mp4"], // Both use ISO BMFF (`ftyp`)
  aac: ["mp4"], // Often stored in mp4 container

  // Video formats
  m4v: ["mp4"], // Apple video format, based on mp4
  mov: ["mp4"], // QuickTime (ftypqt, similar to mp4)
  "3g2": ["3gp"],

  // Other formats
  db: ["sqlite"],
  azw: ["mobi"],
  azw3: ["mobi"],
  ai: ["ps", "pdf"],
};

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

  // --- Image formats ---
  if (hex.startsWith("FFD8FF")) return "jpg";
  if (hex.startsWith("89504E47")) return "png";
  if (hex.startsWith("47494638")) return "gif";
  if (hex.startsWith("424D")) return "bmp";
  if (hex.startsWith("49492A00") || hex.startsWith("4D4D002A")) return "tiff";
  if (hex.startsWith("00000100") || hex.startsWith("00000200")) return "ico";
  if (hex.startsWith("52494646") && ascii === "WEBP") return "webp";

  // --- Document formats ---
  if (hex.startsWith("25504446")) return "pdf";
  if (hex.startsWith("D0CF11E0")) return "doc"; // could also be xls, ppt
  if (hex.startsWith("FF575043")) return "wpd";
  if (hex.startsWith("504B0304")) return "zip-based"; // docx, xlsx, pptx, jar, apk

  // --- Archive formats ---
  if (hex.startsWith("52617221")) return "rar";
  if (hex.startsWith("1F8B08")) return "gz";
  if (hex.startsWith("213C617263683E0A")) return "deb";
  if (hex.startsWith("504B0304") && buffer.includes(Buffer.from("mimetypeapplication/epub+zip"))) {
    return "epub";
  }

  // --- .tar ---
  const ustar = buffer.toString("ascii", 257, 262);
  if (ustar === "ustar") return "tar";

  // --- .iso ---
  if (buffer.length > 32774) {
    const isoMagic = buffer.toString("ascii", 32769, 32774);
    if (isoMagic === "CD001") return "iso";
  }

  // --- SVG (XML-based image) ---
  const asciiStart = buffer.toString("utf8", 0, 100).toLowerCase();
  if (asciiStart.includes("<svg") && asciiStart.includes("<")) return "svg";

  // --- Video formats ---
  if (hex.startsWith("3026B2758E66CF11")) return "wmv"; // ASF header
  if (hex.startsWith("1A45DFA3")) return "webm";
  if (hex.startsWith("52494646")) {
    const riffType = buffer.toString("ascii", 8, 12);
    if (riffType === "AVI ") return "avi";
    if (riffType === "WAVE") return "wav"; // RIFF but it's audio
  }
  const ftyp = buffer.toString("ascii", 4, 12).toLowerCase();
  if (ftyp.startsWith("ftyp3gp") || ftyp.startsWith("ftyp3g2")) return "3gp";

  // --- Audio formats ---
  if (hex.startsWith("494433")) return "mp3"; // ID3
  if (hex.startsWith("FFFB")) return "mp3"; // MPEG-1 Layer III frame
  if (hex.startsWith("4F676753")) return "ogg"; // OggS

  // other formats
  if (hex.startsWith("377ABCAF271C")) return "7z";
  if (hex.startsWith("4D5A")) return "exe";
  if (hex.startsWith("53514C69746520666F726D61")) return "sqlite";
  if (hex.startsWith("00010000")) return "mdb";
  if (buffer.length > 68 && buffer.toString("ascii", 60, 68) === "BOOKMOBI") return "mobi";
  if (hex.startsWith("38425053")) return "psd";
  if (hex.startsWith("25215053")) return "ai"; // EPS-based
  if (hex.startsWith("25504446")) return "ai"; // PDF-based
  if (hex.startsWith("0606EDF5")) return "indd";

  // --- Audio/Video: ISO Base Media File Format (MP4, M4A, MOV, etc.) ---
  const ftypTag = buffer.toString("ascii", 4, 8);
  const brand = buffer.toString("ascii", 8, 12).trim();
  if (ftypTag === "ftyp") {
    const isoBrands = ["mp42", "isom", "iso2", "avc1"];
    const m4aBrands = ["M4A", "M4B", "mp71"];
    const movBrands = ["qt"];

    if (isoBrands.includes(brand)) return "mp4";
    if (m4aBrands.includes(brand)) return "m4a";
    if (movBrands.includes(brand)) return "mov";
  }

  // --- HEIC/HEIF ---
  if (buffer.toString("ascii", 4, 12).includes("ftyp")) {
    const heicBrand = buffer.toString("ascii", 8, 12).toLowerCase();
    if (["heic", "heix", "mif1", "msf1"].includes(heicBrand)) return "heic";
  }

  // --- Plain text fallback (UTF-8 printable characters only) ---
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
export async function validateFileBuffer(buffer: Buffer, originalName: string): Promise<ValidationResult> {
  const extension = getFileExtension(originalName);
  let actualType = getContentTypeFromBuffer(buffer);

  if (actualType === "zip-based") {
    actualType = checkZipBasedFormat(buffer);
  }

  const isValid = actualType === extension || (extensionAliases[extension]?.includes(actualType) ?? false);

  return {
    fileName: originalName,
    extension,
    actualType,
    isValid,
  };
}
