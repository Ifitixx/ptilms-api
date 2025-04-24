// ptilms-api/routes/uploads.js
import { Router } from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import sanitize from 'sanitize-filename';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import s3 from '../config/aws.js';
import config from '../config/config.cjs';
import logger from '../utils/logger.js';

const { info, error: _error } = logger;
const router = Router();

// Configuration
const MAX_FILE_SIZE = 1024 * 1024 * 100; // 100MB
const ALLOWED_FILE_TYPES = /pdf|doc|docx|jpeg|jpg|png/; // Restrict to common document and image types

// Helper functions
const isValidFileType = (file) => {
  const extname = path.extname(file.originalname).toLowerCase().replace('.', '');
  return ALLOWED_FILE_TYPES.test(extname);
};

// Configure multer for in-memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (req, file, cb) => {
    if (isValidFileType(file)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type. Only ${ALLOWED_FILE_TYPES} are allowed.`), false);
    }
  }
});

const handleFileUpload = async (file) => {
  if (!file) throw new Error('No file uploaded');
  
  const originalName = sanitize(file.originalname);
  const fileName = uuidv4(); // Use only UUID for the key
  const bucketName = 'ptilms-uploads';

  const params = {
    Bucket: bucketName,
    Key: fileName,
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  try {
    const result = await s3.upload(params).promise();
    return {
      originalName, // Store sanitized original name separately
      fileName: result.Key, // Store only the key
      size: file.size,
      mimetype: file.mimetype
    };
  } catch (err) {
    _error('MinIO upload error:', err);
    throw new Error('File upload failed');
  }
};

// Single file upload
router.post('/material', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    const fileData = await handleFileUpload(req.file);
    res.status(201).json({
      message: 'File uploaded successfully',
      data: {
        ...fileData,
        url: `${config.minio.endpoint}/ptilms-uploads/${fileData.fileName}` // Reconstruct URL
      }
    });
  } catch (err) {
    _error('Upload error:', err);
    res.status(400).json({ error: err.message });
  }
});

// Multiple files upload
router.post('/materials', authenticateToken, upload.array('files', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      throw new Error('No files uploaded');
    }

    const uploadResults = await Promise.all(
      req.files.map(file => handleFileUpload(file))
    );

    res.status(201).json({
      message: 'Files uploaded successfully',
      data: uploadResults.map(fileData => ({
        ...fileData,
        url: `${config.minio.endpoint}/ptilms-uploads/${fileData.fileName}`
      }))
    });
  } catch (err) {
    _error('Bulk upload error:', err);
    res.status(400).json({ error: err.message });
  }
});

// Error handling
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        error: `File size too large. Max size is ${MAX_FILE_SIZE / (1024 * 1024)}MB`
      });
    }
    return res.status(400).json({ error: `Upload error: ${err.message}` });
  } else if (err) {
    res.status(400).json({ error: err.message });
  }
  next();
});

export default router;