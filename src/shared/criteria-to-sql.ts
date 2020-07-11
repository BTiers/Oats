import FilterType from '../enums/filter-options.enum';

/**
 * Used to create SQL 'LIKE' synthax 
 * @param filter - FilterType
 * @param criteria - String | Number
 * @deprecated
 */
export default function filterToSQL(filter: FilterType, criteria: String | Number): String {
  switch (filter) {
    /* String specific */
    case FilterType.Contains:
      return `%${criteria}%`;
    case FilterType.NotContains:
      return `%${criteria}%`;
    case FilterType.BeginWith:
      return `${criteria}%`;
    case FilterType.EndWith:
      return `%${criteria}`;
    default:
      return `${criteria}`;
  }
}
