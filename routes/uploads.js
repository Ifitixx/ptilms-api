// ptilms-api/routes/uploads.js
import { Router } from 'express';
import multer, { diskStorage } from 'multer';
import fs from 'fs';
import path from 'path';
import sanitize from 'sanitize-filename';
const router = Router();
import authMiddleware from '../middlewares/authMiddleware.js';
const { authenticateToken } = authMiddleware;

// Ensure the uploads directory exists
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('Uploads directory created successfully.');
}

const storage = diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const sanitizedFilename = sanitize(`${Date.now()}-${file.originalname}`);
    cb(null, sanitizedFilename);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 1024 * 1024 * 5, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === 'application/pdf' ||
      file.mimetype === 'image/jpeg' ||
      file.mimetype === 'image/png'
    ) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, JPEG, and PNG are allowed.'), false);
    }
  },
}).single('file');

router.post('/upload/material', authenticateToken, (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'File size too large. Max size is 5MB' });
      }
      if (err.message === 'Invalid file type. Only PDF, JPEG, and PNG are allowed.') {
        return res.status(400).json({ error: err.message });
      }
      return res.status(500).json({ error: 'An error occurred during file upload' });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    res.json({ url: req.file.path });
  });
});

export default router;