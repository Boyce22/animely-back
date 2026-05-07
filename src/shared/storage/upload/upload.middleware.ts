import path from 'path';
import multer from 'multer';

import { BadRequestError } from '@errors';

import { Request, Response, NextFunction } from 'express';

interface UploadConfig {
  maxSize: number;
  allowedMimes: readonly string[];
  fieldName?: string;
  useDisk?: boolean;
}

const getStorage = (useDisk: boolean) => {
  if (useDisk) {
    return multer.diskStorage({
      destination: '/tmp/uploads',
      filename: (_req, file, cb) => {
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
      },
    });
  }

  return multer.memoryStorage();
};

export const uploadMiddleware = (config: UploadConfig) => {
  const { maxSize, allowedMimes, fieldName = 'file', useDisk = false } = config;

  const upload = multer({
    storage: getStorage(useDisk),
    limits: { fileSize: maxSize, files: 1 },
    fileFilter: (_req, file, cb) => {
      const isAllowed = allowedMimes.includes(file.mimetype);

      if (isAllowed) {
        cb(null, true);
      } else {
        cb(new BadRequestError(`Invalid file type. Allowed: ${allowedMimes.join(', ')}`));
      }
    },
  });

  return (req: Request, res: Response, next: NextFunction) => {
    upload.single(fieldName)(req, res, (err: any) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          const sizeMB = (maxSize / (1024 * 1024)).toFixed(2);
          return next(new BadRequestError(`File too large. Maximum: ${sizeMB}MB`));
        }
        return next(new BadRequestError(`Upload error: ${err.message}`));
      }

      if (err) return next(err);

      next();
    });
  };
};

export const uploadMultipleMiddleware = (config: UploadConfig & { maxFiles?: number }) => {
  const { maxSize, allowedMimes, fieldName = 'files', maxFiles = 10, useDisk = false } = config;

  const upload = multer({
    storage: getStorage(useDisk),
    limits: { fileSize: maxSize, files: maxFiles },
    fileFilter: (_req, file, cb) => {
      const isAllowed = allowedMimes.includes(file.mimetype);

      if (isAllowed) {
        cb(null, true);
      } else {
        cb(new BadRequestError(`Invalid file type. Allowed: ${allowedMimes.join(', ')}`));
      }
    },
  });

  return (req: Request, res: Response, next: NextFunction) => {
    upload.array(fieldName, maxFiles)(req, res, (err: any) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          const sizeMB = (maxSize / (1024 * 1024)).toFixed(2);
          return next(new BadRequestError(`File too large. Maximum: ${sizeMB}MB`));
        }

        if (err.code === 'LIMIT_FILE_COUNT') {
          return next(new BadRequestError(`Too many files. Maximum: ${maxFiles}`));
        }

        return next(new BadRequestError(`Upload error: ${err.message}`));
      }

      if (err) return next(err);

      next();
    });
  };
};
