import getFilterParams from '../getFilterParams';

describe('getFilterParams', function() {
  const path: string = '/resource';
  const pathWithPaginationParams: string = '/resource?page=0&perPage=60';
  const pathWithPageParams: string = '/resource?page=0';
  const pathWithPerPageParams: string = '/resource?perPage=60';
  const pathWithExtraParams: string = '/resource?page=0&perPage=60&param[key][]=value&param2[key][]=value';

  it('should work without params', () => {
    expect(getFilterParams(path, path)).toBe('');
  })

  it('should remove pagination param', () => {
    expect(getFilterParams(pathWithPaginationParams, path)).toBe('');
    expect(getFilterParams(pathWithPageParams, path)).toBe('');
    expect(getFilterParams(pathWithPerPageParams, path)).toBe('');
  })

  it('should remove any given params', () => {
    expect(getFilterParams(pathWithExtraParams, path)).toBe('&param[key][]=value&param2[key][]=value');
    expect(getFilterParams(pathWithExtraParams, path, ['param[key][]'])).toBe('&param2[key][]=value');
    expect(getFilterParams(pathWithExtraParams, path, ['param[key][]', 'param2[key][]'])).toBe('');
  })
})