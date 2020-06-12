enum FilterType {
  Is = 'is',
  Isnot = 'isnot',

  /* String Specifics*/
  Contains = 'contains',
  NotContains = 'notcontains',
  BeginWith = 'beginwith',
  EndWith = 'endswith',

  /* Number Specific */
  Equal = 'equal',
  Inferior = 'inferior',
  Superior = 'superior',
  InferiorEqual = 'inferiorequal',
  SuperiorEqual = 'superiorequal',


  Empty = 'empty',
  NotEmpty = 'notempty',
}

export default FilterType;