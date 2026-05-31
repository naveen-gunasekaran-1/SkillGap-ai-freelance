import type { NextFunction, Request, RequestHandler, Response } from 'express';
import { verifyAccessToken } from '../lib/jwt';
import { HttpError } from '../lib/httpError';
import { prisma } from '../lib/prisma';
import { parseStringArray } from '../lib/jsonFields';
import { COMPANY_VERIFICATION_STATUS, ROLE, type Role } from '../lib/constants';

export interface AuthUser {
  id: string;
  role: Role;
  email: string;
  name: string;
  skills: string[];
  companyId: string | null;
}

declare global {
  namespace Express {
    interface Request {
      auth?: AuthUser;
    }
  }
}

/**
 * Require a valid Bearer access token and attach the user to the request.
 */
export function requireAuth(): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction) => {
    void (async () => {
      try {
        const header = req.headers.authorization;
        if (!header?.startsWith('Bearer ')) {
          next(new HttpError(401, 'Missing access token'));
          return;
        }
        const token = header.slice('Bearer '.length).trim();
        if (!token) {
          next(new HttpError(401, 'Missing access token'));
          return;
        }
        let payload: { sub: string; role: string };
        try {
          payload = verifyAccessToken(token);
        } catch {
          next(new HttpError(401, 'Invalid or expired access token'));
          return;
        }

        const user = await prisma.user.findUnique({ where: { id: payload.sub } });
        if (!user) {
          next(new HttpError(401, 'User not found'));
          return;
        }

        req.auth = {
          id: user.id,
          role: user.role as Role,
          email: user.email,
          name: user.name,
          skills: parseStringArray(user.skillsJson),
          companyId: user.companyId,
        };
        next();
      } catch (err) {
        next(err);
      }
    })();
  };
}

/**
 * Require one of the given roles after `requireAuth()`.
 */
export function requireRoles(...roles: Role[]): RequestHandler {
  return (req, _res, next) => {
    if (!req.auth) {
      next(new HttpError(401, 'Unauthorized'));
      return;
    }
    if (!roles.includes(req.auth.role)) {
      next(new HttpError(403, 'Forbidden'));
      return;
    }
    next();
  };
}

/**
 * Require a company account to be verified before sensitive recruiter actions.
 * Admin users are allowed through for operational support.
 */
export function requireVerifiedCompany(): RequestHandler {
  return (req, _res, next) => {
    void (async () => {
      try {
        if (!req.auth) {
          next(new HttpError(401, 'Unauthorized'));
          return;
        }
        if (req.auth.role === ROLE.ADMIN) {
          next();
          return;
        }
        if (req.auth.role !== ROLE.COMPANY || !req.auth.companyId) {
          next(new HttpError(403, 'Verified company access required'));
          return;
        }
        const company = await prisma.company.findUnique({
          where: { id: req.auth.companyId },
          select: { isVerified: true, verificationStatus: true },
        });
        if (
          !company?.isVerified ||
          company.verificationStatus !== COMPANY_VERIFICATION_STATUS.VERIFIED
        ) {
          next(new HttpError(403, 'Company verification is required before using this feature'));
          return;
        }
        next();
      } catch (err) {
        next(err);
      }
    })();
  };
}

/**
 * Attach `req.auth` when a valid Bearer token is present; otherwise continue unauthenticated.
 */
export function optionalAuth(): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction) => {
    void (async () => {
      try {
        const header = req.headers.authorization;
        if (!header?.startsWith('Bearer ')) {
          next();
          return;
        }
        const token = header.slice('Bearer '.length).trim();
        if (!token) {
          next();
          return;
        }
        try {
          const payload = verifyAccessToken(token);
          const user = await prisma.user.findUnique({ where: { id: payload.sub } });
          if (user) {
            req.auth = {
              id: user.id,
              role: user.role as Role,
              email: user.email,
              name: user.name,
              skills: parseStringArray(user.skillsJson),
              companyId: user.companyId,
            };
          }
        } catch {
          // ignore invalid/expired tokens for public endpoints
        }
        next();
      } catch (err) {
        next(err);
      }
    })();
  };
}
