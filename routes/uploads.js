// ptilms-api/routes/uploads.js
// ptilms-api/routes/uploads.js
import { Router } from 'express';
import multer, { diskStorage } from 'multer';
import fs from 'fs';
import path from 'path';
import sanitize from 'sanitize-filename';
import { v4 as uuidv4 } from 'uuid'; // For generating unique filenames
const router = Router();
import authMiddleware from '../middlewares/authMiddleware.js';
const { authenticateToken } = authMiddleware;

// --- Configuration ---

const MAX_FILE_SIZE = 1024 * 1024 * 100; // 100MB (adjust as needed)
const ALLOWED_FILE_TYPES = /pdf|jpeg|jpg|png|gif|mp4|mov|avi|txt|doc|docx|xls|xlsx|csv/; // Add more types as needed

// --- Helper Functions ---

const isValidFileType = (file) => {
  const extname = path.extname(file.originalname).toLowerCase();
  const mimetype = file.mimetype;
  return ALLOWED_FILE_TYPES.test(extname) && ALLOWED_FILE_TYPES.test(mimetype);
};

const generateUniqueFilename = (file) => {
  const extname = path.extname(file.originalname);
  return `${uuidv4()}${extname}`;
};

// --- Storage Setup ---

const storage = diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(process.cwd(), 'uploads');
    // Create the directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
      console.log('Uploads directory created successfully.');
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const sanitizedFilename = sanitize(generateUniqueFilename(file));
    cb(null, sanitizedFilename);
  },
});

// --- Multer Instance ---

const upload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
  fileFilter: (req, file, cb) => {
    if (isValidFileType(file)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type. Only ${ALLOWED_FILE_TYPES} are allowed.`), false);
    }
  },
});

// --- Routes ---

// Single file upload - Adjusted route path for consistency
router.post('/material', authenticateToken, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  res.json({ url: `/uploads/${req.file.filename}`, filename: req.file.filename });
});

// Multiple files upload (up to 5) - Adjusted route path
router.post('/materials', authenticateToken, upload.array('files', 5), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'No files uploaded' });
  }
  const files = req.files.map(file => ({ url: `/uploads/${file.filename}`, filename: file.filename }));
  res.json(files);
});

// --- Error Handling ---

router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: `File size too large. Max size is ${MAX_FILE_SIZE / (1024 * 1024)}MB` });
    }
    return res.status(400).json({ error: `Multer error: ${err.message}` });
  } else if (err) {
    return res.status(400).json({ error: err.message }); // Handle custom errors from fileFilter
  }
  next();
});

export default router;