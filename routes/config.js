// ptilms-api/routes/config.js
import { Router } from 'express';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/config', authenticateToken, (req, res) => {
  res.json({ baseUrl: process.env.APP_BASE_URL });
});

export default router;