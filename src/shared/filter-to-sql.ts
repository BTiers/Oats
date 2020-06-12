import FilterType from '../enums/filter-options.enum';

export default function filterToSQL(filter: FilterType, index: Number): String {
  switch (filter) {
    case FilterType.Equal:
      return `= :criteria${index}`;
    case FilterType.Is:
      return `= :criteria${index}`;
    case FilterType.Isnot:
      return `!= :criteria${index}`;

    /* Number specific */
    case FilterType.Inferior:
      return `< :criteria${index}`;
    case FilterType.Superior:
      return `> :criteria${index}`;
    case FilterType.InferiorEqual:
      return `<= :criteria${index}`;
    case FilterType.SuperiorEqual:
      return `>= :criteria${index}`;

    /* String specific */
    case FilterType.Contains:
      return `ILIKE :criteria${index}`;
    case FilterType.NotContains:
      return `NOT ILIKE :criteria${index}`;
    case FilterType.BeginWith:
      return `ILIKE :criteria${index}`;
    case FilterType.EndWith:
      return `ILIKE :criteria${index}`;

    case FilterType.Empty:
      return `IS NULL`;
    case FilterType.NotEmpty:
      return `IS NOT NULL`;
    default:
      return '';
  }
}
