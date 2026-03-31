interface PaginationMeta {
  totalItems: number;
  itemCount: number;
  totalPages: number;
  currentPage: number;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMeta;
}
