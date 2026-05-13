import { Router } from 'express';
import authRoutes from './auth';
import applicationsRoutes from './applications';
import companiesRoutes from './companies';
import aiRoutes from './ai';
import jobsRoutes from './jobs';
import usersRoutes from './users';
import uploadsRoutes from './uploads';

const router = Router();

router.get('/', (_req, res) => {
  res.json({ name: 'skillgap-ai-api' });
});

router.use('/auth', authRoutes);
router.use('/applications', applicationsRoutes);
router.use('/companies', companiesRoutes);
router.use('/ai', aiRoutes);
router.use('/jobs', jobsRoutes);
router.use('/users', usersRoutes);
router.use('/uploads', uploadsRoutes);

export default router;
