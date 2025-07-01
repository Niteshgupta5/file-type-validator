# File Type Validator (TypeScript)

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
npm install
```

Or if used as a library:

```bash
npm install your-github-org/file-type-validator-ts
```

## 🚀 Usage

1. Validate a file uploaded from a form

Use with Express & Multer:

```bash
import { validateFileBuffer } from "./src/validator";

app.post("/upload", upload.single("file"), (req, res) => {
  const result = validateFileBuffer(req.file.buffer, req.file.originalname);
  res.json(result);
});
```

## 🧪 Supported File Types

- Images: jpg, jpeg, png, gif, bmp, tiff, webp, heic
- Documents: pdf, doc, docx, xls, xlsx, pptx, rtf, txt
- Audio/Video: mp3, wav, mp4
- Archives: zip, rar, 7z, gz
