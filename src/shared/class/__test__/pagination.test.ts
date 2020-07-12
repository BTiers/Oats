import Pagination from '../pagination';

describe('getFilterParams', function () {
  const pagination = new Pagination('/offers', 0, 20, 100, '&param=value');
  const empty = new Pagination('/offers', 0, 20, 0, '&param=value');
  const exceededPage = new Pagination('/offers', 10, 20, 100, '&param=value');

  it('should compute take and skip properties', () => {
    expect(pagination.take).toEqual(20);
    expect(pagination.skip).toEqual(0);
  });

  it('should compute the total number of pages', () => {
    expect(pagination.pageCount).toEqual(5);
  });

  it('should compute every links', () => {
    // Valid object
    expect(pagination.selfPageLink).toEqual('/offers?page=0&perPage=20&param=value');
    expect(pagination.firstPageLink).toEqual('/offers?page=0&perPage=20&param=value');
    expect(pagination.previousPageLink).toBe(null);
    expect(pagination.nextPageLink).toEqual('/offers?page=1&perPage=20&param=value');
    expect(pagination.lastPageLink).toEqual('/offers?page=4&perPage=20&param=value');

    // Empty object
    expect(empty.selfPageLink).toEqual('/offers?page=0&perPage=20&param=value');
    expect(empty.firstPageLink).toEqual('/offers?page=0&perPage=20&param=value');
    expect(empty.previousPageLink).toBe(null);
    expect(empty.nextPageLink).toEqual(null);
    expect(empty.lastPageLink).toEqual('/offers?page=0&perPage=20&param=value');
  });

  it('should compute metadata', () => {
    // Valid object
    expect(pagination.metadata).toEqual({
      page: 0,
      perPage: 20,
      pageCount: 5,
      totalItems: 100,
      links: {
        self: '/offers?page=0&perPage=20&param=value',
        first: '/offers?page=0&perPage=20&param=value',
        previous: null,
        next: '/offers?page=1&perPage=20&param=value',
        last: '/offers?page=4&perPage=20&param=value',
      },
    });

    // Empty object
    expect(empty.metadata).toEqual({
      page: 0,
      perPage: 20,
      pageCount: 1,
      totalItems: 0,
      links: {
        self: '/offers?page=0&perPage=20&param=value',
        first: '/offers?page=0&perPage=20&param=value',
        previous: null,
        next: null,
        last: '/offers?page=0&perPage=20&param=value',
      },
    });
  });

  it('should create all necessary values in case of error', () => {
    expect(pagination.exceedPageLimit).toEqual(false);
    expect(empty.exceedPageLimit).toEqual(false);
    expect(exceededPage.exceedPageLimit).toEqual(true);

    expect(exceededPage.exceedPageLimitHint)
      .toEqual(`Page n°10 cannot be found with 20 items per page.
    Last available page can be retrieved here:
    /offers?page=4&perPage=20&param=value`);
  });
});
