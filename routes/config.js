// ptilms-api/routes/config.js
import { Router } from 'express';
const router = Router();

router.get('/config', (req, res) => {
  res.json({ baseUrl: process.env.APP_BASE_URL });
});

export default router;