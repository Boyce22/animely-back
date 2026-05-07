import { ALLOWED_IMAGES, ALLOWED_ZIP, UPLOAD_LIMITS } from './upload.constants';

import { uploadMiddleware } from '@middlewares';

export const UPLOAD_MIDDLEWARE = Object.freeze({
  PROFILE_PICTURE: uploadMiddleware({
    allowedMimes: ALLOWED_IMAGES,
    maxSize: UPLOAD_LIMITS.PROFILE_PICTURE,
    fieldName: 'profilePicture',
  }),

  BANNER: uploadMiddleware({
    allowedMimes: ALLOWED_IMAGES,
    maxSize: UPLOAD_LIMITS.BANNER,
    fieldName: 'banner',
  }),

  MANGA_COVER: uploadMiddleware({
    allowedMimes: ALLOWED_IMAGES,
    maxSize: UPLOAD_LIMITS.MANGA_COVER,
    fieldName: 'cover',
  }),

  MANGA_PAGES_ZIP: uploadMiddleware({
    allowedMimes: ALLOWED_ZIP,
    maxSize: UPLOAD_LIMITS.MANGA_PAGES_ZIP,
    fieldName: 'pages',
  }),
});
