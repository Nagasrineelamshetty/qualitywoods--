import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './authmiddleware';

export const verifyAdmin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  if (!req.user.isAdmin) {
    return res.status(403).json({ message: 'Access denied: Admins only' });
  }

  next();
};
