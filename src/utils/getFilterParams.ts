/**
 * Useful to extract query params to give correct links back in pagination metadata.
 * Remove page & perPage params to give the controller control over how they are handled
 *
 *
 * @param {string} url - The retrieved URL (Commonly: request.originalUrl)
 * @param {string} prefix - The route prefix to remove
 * @param {string} params - (Optionnal) Additional values to remove
 *
 * @example
 * getFilterParams('/offers?annualSalary[criterias][]=456&perPage=100&page=0', '/offers');
 * getFilterParams('/offers?annualSalary[criterias][]=456', '/offers', ['annualSalary[criterias][]']);
 */

export default function getFilterParams(url: string, prefix: string, params?: string[]): string {
  let result = url;

  result = result.replace(/\A?page=[^&]+&*/g, '');
  result = result.replace(/\A?perPage=[^&]+&*/g, '');
  result = result.replace(new RegExp(`${prefix}[?]?`, 'gm'), '');

  params?.forEach((param) => (result = result.replace(new RegExp(`\A?${param}=[^&]+&*`, 'g'), '')));

  if (result[result.length - 1] === '&') result = result.substring(0, result.length - 1);

  if (result === '') return result
  return `&${result}`;
}
