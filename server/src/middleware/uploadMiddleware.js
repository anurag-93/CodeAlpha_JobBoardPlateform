import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import { UPLOAD_CONFIG, initUploadDir } from '../config/upload.js';

initUploadDir();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    initUploadDir();
    cb(null, UPLOAD_CONFIG.uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}`;
    const sanitizedBase = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 30);
    cb(null, `${sanitizedBase}-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();

  const isMimeValid = UPLOAD_CONFIG.allowedMimeTypes.includes(file.mimetype);
  const isExtValid = UPLOAD_CONFIG.allowedExtensions.includes(ext);

  if (isMimeValid && isExtValid) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Invalid file type. Only PDF (.pdf) and Word documents (.doc, .docx) are allowed. Received mimetype: ${file.mimetype}, ext: ${ext}`
      ),
      false
    );
  }
};

export const uploadResume = multer({
  storage,
  limits: {
    fileSize: UPLOAD_CONFIG.maxSize, // default 5MB
  },
  fileFilter,
});
