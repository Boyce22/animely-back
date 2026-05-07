import { Router } from 'express';
import { userRouter, profileCustomizationRouter } from '@/modules/user/user.factory';
import { authRouter } from '@/modules/auth/auth.factory';
import { countryRouter } from '@/modules/country/country.factory';
import {
  workRouter,
  tagRouter,
  commentRouter,
  ratingRouter,
} from '@/modules/work/work.factory';

const routes = Router();

routes.use('/auth', authRouter);
routes.use('/users', userRouter);
routes.use('/users', profileCustomizationRouter);
routes.use('/countries', countryRouter);
routes.use('/works', workRouter);
routes.use('/tags', tagRouter);
routes.use('/comments', commentRouter);
routes.use('/ratings', ratingRouter);

export default routes;
