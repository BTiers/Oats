import { PaginationMetadata } from 'shared/interfaces/pagination.interface';

export default class Pagination {
  resourcePath: string;
  additionalParams?: string;
  page: number;
  perPage: number;
  total: number;

  constructor(
    resourcePath: string,
    page: number,
    perPage: number,
    total: number,
    additionalParams?: string,
  ) {
    this.resourcePath = resourcePath;
    this.page = page;
    this.perPage = perPage;
    this.total = total;
    this.additionalParams = additionalParams;
  }

  get exceedPageLimit(): boolean {
    return this.page > this.pageCount;
  }

  get exceedPageLimitHint(): string {
    return `Page n°${this.page} cannot be found with ${this.perPage} items per page.
    Last available page can be retrieved here:
    ${this.resourcePath}?page=${this.pageCount - 1}&perPage=${this.perPage}${this.additionalParams || ''}`;
  }

  get pageCount(): number {
    return Math.ceil(this.total / this.perPage);
  }

  get take(): number {
    return this.perPage;
  }

  get skip(): number {
    return this.page * this.perPage;
  }

  get selfPageLink(): string {
    return `${this.resourcePath}?page=${this.page}&perPage=${this.perPage}`;
  }

  get firstPageLink(): string {
    return `${this.resourcePath}?page=0&perPage=${this.perPage}`;
  }

  get nextPageLink(): string | null {
    return this.page + 1 >= this.pageCount
      ? null
      : `${this.resourcePath}?page=${this.page + 1}&perPage=${this.perPage}`;
  }

  get previousPageLink(): string | null {
    return this.page === 0
      ? null
      : `${this.resourcePath}?page=${this.page - 1}&perPage=${this.perPage}`;
  }

  get lastPageLink(): string {
    return `${this.resourcePath}?page=${
      this.pageCount > 0 ? this.pageCount - 1 : this.pageCount
    }&perPage=${this.perPage}`;
  }

  get metadata(): PaginationMetadata {
    return {
      page: this.page,
      perPage: this.perPage,
      pageCount: this.pageCount,
      totalItems: this.total,
      links: {
        self: `${this.selfPageLink}${this.additionalParams || ''}`,
        first: `${this.firstPageLink}${this.additionalParams || ''}`,
        previous: `${this.previousPageLink}${this.additionalParams || ''}`,
        next: `${this.nextPageLink}${this.additionalParams || ''}`,
        last: `${this.lastPageLink}${this.additionalParams || ''}`,
      },
    };
  }

  get emptyMetadata(): PaginationMetadata {
    return {
      page: 0,
      perPage: this.perPage,
      pageCount: 1,
      totalItems: 0,
      links: {
        self: `${this.selfPageLink}${this.additionalParams || ''}`,
        first: `${this.firstPageLink}${this.additionalParams || ''}`,
        previous: null,
        next: null,
        last: `${this.lastPageLink}${this.additionalParams || ''}`,
      },
    };
  }
}
