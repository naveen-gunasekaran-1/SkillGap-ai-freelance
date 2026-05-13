import { Router } from 'express';
import multer from 'multer';
import { asyncHandler } from '../lib/asyncHandler';
import { HttpError } from '../lib/httpError';
import { uploadResume } from '../lib/storage';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 6 * 1024 * 1024 },
});

const allowedTypes = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

router.post(
  '/resume',
  upload.single('file'),
  asyncHandler(async (req, res) => {
    const file = req.file;
    if (!file) {
      throw new HttpError(400, 'Resume file is required');
    }
    if (!allowedTypes.has(file.mimetype)) {
      throw new HttpError(400, 'Resume must be a PDF or DOC/DOCX file');
    }

    const url = await uploadResume({
      buffer: file.buffer,
      originalName: file.originalname,
      contentType: file.mimetype,
    });

    res.status(201).json({ url });
  }),
);

export default router;
