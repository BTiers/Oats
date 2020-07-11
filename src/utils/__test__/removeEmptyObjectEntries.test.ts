import removeEmptyObjectEntries from '../removeEmptyObjectEntries';

const asUndefined = (): undefined => undefined;

describe('getFilterParams', function () {
  const emptyObject = {};
  const firstLevelEmptyObject = {
    a: asUndefined(),
    b: 'valid',
    c: asUndefined(),
  };
  const nestedEmptyObject = {
    a: asUndefined(),
    b: {
      a: asUndefined(),
      b: {
        a: asUndefined(),
        b: {
          a: asUndefined(),
          b: {
            a: asUndefined(),
            b: 'valid',
            c: asUndefined(),
          },
          c: asUndefined(),
        },
        c: asUndefined(),
      },
      c: asUndefined(),
    },
    c: asUndefined(),
  };

  it('should give back an empty object when given one', () => {
    expect(removeEmptyObjectEntries(emptyObject)).toEqual({});
  });

  it('should purge undefined properties', () => {
    expect(removeEmptyObjectEntries(firstLevelEmptyObject)).toEqual({ b: 'valid' });
  });

  it('should purge undefined properties on nested properties', () => {
    expect(removeEmptyObjectEntries(nestedEmptyObject)).toEqual({
      b: {
        b: {
          b: {
            b: {
              b: 'valid',
            },
          },
        },
      },
    });
  });
});
