import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const UPLOAD_CONFIG = {
  maxSize: (parseInt(process.env.MAX_FILE_SIZE_MB, 10) || 5) * 1024 * 1024,
  allowedMimeTypes: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
  allowedExtensions: ['.pdf', '.doc', '.docx'],
  uploadDir: path.resolve(__dirname, '../../uploads/resumes'),
};

// Ensure upload directory exists
export const initUploadDir = () => {
  if (!fs.existsSync(UPLOAD_CONFIG.uploadDir)) {
    fs.mkdirSync(UPLOAD_CONFIG.uploadDir, { recursive: true });
    console.log(` Created upload directory at: ${UPLOAD_CONFIG.uploadDir}`);
  }
};
