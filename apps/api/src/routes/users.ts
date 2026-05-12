import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { asyncHandler } from '../lib/asyncHandler';
import { HttpError } from '../lib/httpError';
import { toUserDto } from '../lib/serializers';
import { requireAuth } from '../middleware/auth';
import { stringifyStringArray } from '../lib/jsonFields';

const patchSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  skills: z.array(z.string().min(1).max(64)).max(40).optional(),
  avatar: z.string().url().max(500).optional(),
});

const router = Router();

router.patch(
  '/me',
  requireAuth(),
  asyncHandler(async (req, res) => {
    const body = patchSchema.parse(req.body);
    if (Object.keys(body).length === 0) {
      throw new HttpError(400, 'No fields to update');
    }

    const user = await prisma.user.update({
      where: { id: req.auth!.id },
      data: {
        ...(body.name ? { name: body.name } : {}),
        ...(body.skills ? { skillsJson: stringifyStringArray(body.skills) } : {}),
        ...(body.avatar ? { avatar: body.avatar } : {}),
      },
    });

    res.json({ user: toUserDto(user) });
  }),
);

export default router;
