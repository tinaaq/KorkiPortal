import multer from 'multer';
import path from 'path';
import fs from 'fs';

const uploadDir = path.join(process.cwd(), 'uploads', 'avatars');

fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/\s+/g, '-');
    const unique = Date.now();
    cb(null, `${base}-${unique}${ext}`);
  },
});

function fileFilter(_req, file, cb) {

  if (!file.mimetype.startsWith('image/')) {
    return cb(new Error('Dozwolone są tylko pliki graficzne'), false);
  }
  cb(null, true);
}

export const uploadAvatar = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
}).single('photo');