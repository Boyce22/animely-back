import { Request, Response, NextFunction } from 'express';

type AsyncHandler<T extends Request = Request> = (
  req: T,
  res: Response,
  next: NextFunction,
) => Promise<void>;

export const asyncHandler =
  <T extends Request = Request>(fn: AsyncHandler<T>) =>
  (req: Request, res: Response, next: NextFunction): void => {
    (fn as AsyncHandler)(req, res, next).catch(next);
  };
