export interface Meta {
  totalItems: number;
  itemCount: number;
  totalPages: number;
  currentPage: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: Meta;
}

