interface PaginationLinks {
  self: string;
  first: string;
  previous: string;
  next: string;
  last: string;
}

export interface PaginationMetadata {
  page: number;
  perPage: number;
  pageCount: number;
  totalItems: number;
  links: PaginationLinks;
}