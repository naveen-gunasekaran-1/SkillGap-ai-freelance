import { Router } from 'express';

const router = Router();

router.get('/', (_req, res) => {
  res.json({ route: 'ai' });
});

export default router;
