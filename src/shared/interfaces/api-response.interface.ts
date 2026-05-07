export interface ApiResponse<T> {
  message?: string;
  data: T;
}

export type CursorPagination = {
  type: 'cursor';
  nextCursor: string | null;
  hasNext: boolean;
};

export type OffsetPagination = {
  type: 'offset';
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type Pagination = CursorPagination | OffsetPagination;

export interface PaginatedResponse<T> {
  items: T[];
  pagination: Pagination;
}