import { z } from 'zod';

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

export function paginationMeta(input: { page: number; limit: number; total: number }): {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
} {
  const totalPages = Math.max(1, Math.ceil(input.total / input.limit));
  return {
    page: input.page,
    limit: input.limit,
    total: input.total,
    totalPages,
    hasNextPage: input.page < totalPages,
  };
}
