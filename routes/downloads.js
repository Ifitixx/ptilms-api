// ptilms-api/routes/downloads.js
import { Router } from 'express';
import FileService from '../services/fileService.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import { getOriginalFilename } from '../utils/fileUtils.js'; // Assuming you have a utility function

const router = Router();
const fileService = new FileService();

router.get('/:fileKey', authenticateToken, async (req, res) => {
  try {
    const { fileKey } = req.params;
    const originalFilename = await getOriginalFilename(fileKey); // Get from DB
    if (!originalFilename) {
      return res.status(404).json({ error: 'Original filename not found' });
    }

    const file = await fileService.getFileStream(fileKey);

    res.setHeader('Content-Type', file.contentType);
    res.setHeader('Content-Length', file.contentLength);
    res.setHeader('Content-Disposition', `attachment; filename="${originalFilename}"`); // Use attachment
    file.stream.pipe(res);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

export default router;