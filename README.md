# File Type Validator (TypeScript)

![npm](https://img.shields.io/npm/v/file-type-validator-ts?color=blue) ![build](https://img.shields.io/badge/build-passing-brightgreen) ![license](https://img.shields.io/npm/l/file-type-validator-ts)

A lightweight TypeScript utility to validate uploaded file content using its buffer. Ensures that the actual content type (magic number) of the file matches its declared file extension.

## ✨ Features

- ✅ Detects common image, document, audio, and video types
- ✅ Validates ZIP-based formats like `.docx`, `.xlsx`, `.pptx`
- ✅ Checks for renamed/misleading file extensions
- ✅ Useful for uploads, security, and validation middleware
- ✅ No external file-type libraries

---

## 📦 Installation

```bash
npm install file-type-validator-ts
```

NPM package: [file-type-validator](https://www.npmjs.com/package/file-type-validator)

## 🚀 Usage

- Validate a file uploaded from a form

Use with Express & Multer:

```bash
import { validateFileBuffer } from "./src/validator";

app.post("/upload", upload.single("file"), (req, res) => {
  const result = validateFileBuffer(req.file.buffer, req.file.originalname);
  res.json(result);
});
```

## 🧪 Supported File Types

📄 Document Files

- pdf
- doc, docx
- dot, dotx
- rtf
- txt, log, csv, tsv, sql, xml, json, ps, tex, md, yml
- ppt, pptx, pps, ppsx
- xls, xlsx, xlsm, xlt, xltx, xltm
- odt, ods
- epub, mobi, azw, azw3
- indd, wps, wpd, psd, ai

🖼 Image Files

- jpg, jpeg, png, bmp, gif, webp, ico, svg, heic, heif

🎧 Audio Files

- mp3, m4a, aac, ogg

🎥 Video Files

- mp4, mov, m4v, webm, wmv, avi, 3gp, 3g2

📦 Compressed & Archive Files

- zip, rar, gz, 7z, tar, deb, apk, jar

🗃 Database Files

- sqlite, db, mdb

🧪 Code Files

- js, ts, php, sh, patch

💻 Executables

- exe
