export interface CommentResponse {
  id: string;
  content: string;
  isSpoiler: boolean;
  isEdited: boolean;
  isPinned: boolean;
  likeCount: number;
  dislikeCount: number;
  replyCount: number;
  workId: string;
  chapterId?: string;
  parentCommentId?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CommentTreeResponse extends CommentResponse {
  replies: CommentTreeResponse[];
}
