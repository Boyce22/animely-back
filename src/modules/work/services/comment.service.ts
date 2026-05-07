import { Logger } from 'pino';

import { CommentRepository } from '@/modules/work/repositories/comment.repository';
import { WorkRepository } from '@/modules/work/repositories/work.repository';
import { CreateCommentInput, PatchCommentInput, QueryCommentsInput } from '@/modules/work/schemas';
import { CommentResponse, CommentTreeResponse } from '@/modules/work/dtos/comment-response.dto';
import { Comment } from '@/modules/work/entities/comment.entity';

import { PaginatedResponse } from '@/shared/interfaces/api-response.interface';
import { Roles } from '@/shared/security';

import { ForbiddenError, NotFoundError } from '@errors';

export class CommentService {
  constructor(
    private readonly commentRepository: CommentRepository,
    private readonly workRepository: WorkRepository,
    private readonly logger: Logger,
  ) {}

  async getComments(query: QueryCommentsInput): Promise<PaginatedResponse<CommentResponse>> {
    const { data, total } = await this.commentRepository.findByWork(query);
    const { page, limit } = query;

    return {
      items: data.map(toCommentResponse),
      pagination: {
        type: 'offset',
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getCommentTree(workId: string, chapterId?: string): Promise<CommentTreeResponse[]> {
    const roots = await this.commentRepository.findTree(workId, chapterId);
    return roots.map(toCommentTreeResponse);
  }

  async getCommentReplies(id: string, page: number, limit: number): Promise<PaginatedResponse<CommentResponse>> {
    const comment = await this.commentRepository.findById(id);
    if (!comment) throw new NotFoundError('Comment not found');

    const { data, total } = await this.commentRepository.findReplies(id, page, limit);

    return {
      items: data.map(toCommentResponse),
      pagination: {
        type: 'offset',
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
  async createComment(input: CreateCommentInput, userId: string): Promise<CommentResponse> {
    const work = await this.workRepository.findById(input.workId);
    if (!work) throw new NotFoundError('Work not found');

    if (input.parentCommentId) {
      const parent = await this.commentRepository.findById(input.parentCommentId);
      if (!parent || parent.workId !== work.id) throw new NotFoundError('Parent comment not found');
    }

    const comment = await this.commentRepository.create({ ...input, userId });

    await this.workRepository.increment(input.workId, 'commentCount', 1);

    if (input.parentCommentId) {
      await this.commentRepository.incrementReplyCount(input.parentCommentId);
    }

    this.logger.info({ commentId: comment.id, workId: input.workId }, 'Comment created');
    return toCommentResponse(comment);
  }

  async patchComment(id: string, input: PatchCommentInput, userId: string, userRole: Roles): Promise<CommentResponse> {
    const comment = await this.commentRepository.findById(id);
    if (!comment) throw new NotFoundError('Comment not found');

    const isPrivileged = userRole === Roles.ADMIN || userRole === Roles.OWNER || userRole === Roles.MODERATOR;

    if (comment.userId !== userId && !isPrivileged) {
      throw new ForbiddenError('You can only edit your own comments');
    }

    // Regular users can only change content and isSpoiler
    const patchData: PatchCommentInput & { isEdited?: boolean } = isPrivileged
      ? { ...input }
      : { content: input.content, isSpoiler: input.isSpoiler };

    if (patchData.content !== undefined) {
      patchData.isEdited = true;
    }

    const updated = await this.commentRepository.patch(id, patchData);
    this.logger.info({ commentId: id }, 'Comment patched');
    return toCommentResponse(updated);
  }

  async deleteComment(id: string, userId: string, userRole: Roles): Promise<void> {
    const comment = await this.commentRepository.findById(id);
    if (!comment) throw new NotFoundError('Comment not found');

    const isPrivileged = userRole === Roles.ADMIN || userRole === Roles.OWNER || userRole === Roles.MODERATOR;

    if (comment.userId !== userId && !isPrivileged) {
      throw new ForbiddenError('You can only delete your own comments');
    }

    await this.commentRepository.softDelete(id);

    await this.workRepository.decrement(comment.workId!, 'commentCount', 1);

    if (comment.parentCommentId) {
      await this.commentRepository.decrementReplyCount(comment.parentCommentId);
    }

    this.logger.info({ commentId: id }, 'Comment deleted');
  }
}

export function toCommentTreeResponse(comment: Comment): CommentTreeResponse {
  return {
    ...toCommentResponse(comment),
    replies: (comment.replies ?? []).map(toCommentTreeResponse),
  };
}

export function toCommentResponse(comment: Comment): CommentResponse {
  return {
    id: comment.id,
    content: comment.content,
    isSpoiler: comment.isSpoiler,
    isEdited: comment.isEdited,
    isPinned: comment.isPinned,
    likeCount: comment.likeCount,
    dislikeCount: comment.dislikeCount,
    replyCount: comment.replyCount,
    workId: comment.workId!,
    chapterId: comment.chapterId,
    parentCommentId: comment.parentCommentId,
    userId: comment.userId,
    createdAt: comment.createdAt.toISOString(),
    updatedAt: comment.updatedAt.toISOString(),
  };
}
