import pino from 'pino';
import { AppDataSource } from '@config';

import { Work } from '@/modules/work/entities/work.entity';
import { Tag } from '@/modules/work/entities/tag.entity';
import { Comment } from '@/modules/work/entities/comment.entity';
import { Rating } from '@/modules/work/entities/rating.entity';
import { Collection } from '@/modules/work/entities/collection.entity';

import { WorkRepository } from '@/modules/work/repositories/work.repository';
import { TagRepository } from '@/modules/work/repositories/tag.repository';
import { CommentRepository } from '@/modules/work/repositories/comment.repository';
import { RatingRepository } from '@/modules/work/repositories/rating.repository';
import { CollectionRepository } from '@/modules/work/repositories/collection.repository';

import { WorkService } from '@/modules/work/services/work.service';
import { TagService } from '@/modules/work/services/tag.service';
import { CommentService } from '@/modules/work/services/comment.service';
import { RatingService } from '@/modules/work/services/rating.service';

import { WorkController } from '@/modules/work/controllers/work.controller';
import { TagController } from '@/modules/work/controllers/tag.controller';
import { CommentController } from '@/modules/work/controllers/comment.controller';
import { RatingController } from '@/modules/work/controllers/rating.controller';

const workLogger = pino({ name: 'work-module' });
const tagLogger = pino({ name: 'tag-module' });
const commentLogger = pino({ name: 'comment-module' });
const ratingLogger = pino({ name: 'rating-module' });

const workRepository = new WorkRepository(
  AppDataSource.getRepository(Work),
  AppDataSource.getRepository(Tag),
);

const collectionRepository = new CollectionRepository(AppDataSource.getRepository(Collection));
const tagRepository = new TagRepository(AppDataSource.getRepository(Tag));
const commentRepository = new CommentRepository(AppDataSource.getTreeRepository(Comment));
const ratingRepository = new RatingRepository(AppDataSource.getRepository(Rating));

const workService = new WorkService(workRepository, collectionRepository, workLogger);
const tagService = new TagService(tagRepository, tagLogger);
const commentService = new CommentService(commentRepository, workRepository, commentLogger);
const ratingService = new RatingService(ratingRepository, workRepository, ratingLogger);

const workController = new WorkController(workService);
const tagController = new TagController(tagService);
const commentController = new CommentController(commentService);
const ratingController = new RatingController(ratingService);

export { workController, tagController, commentController, ratingController };
export const workRouter = workController.router;
export const tagRouter = tagController.router;
export const commentRouter = commentController.router;
export const ratingRouter = ratingController.router;
