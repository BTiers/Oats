import {
  IsOptional,
  IsEnum,
  IsArray,
  IsNotEmpty,
  IsNumberString,
  ArrayUnique,
} from 'class-validator';
import {
  FindOperator,
  IsNull,
  Not,
  In,
  LessThan,
  LessThanOrEqual,
  MoreThan,
  MoreThanOrEqual,
} from 'typeorm';

import { Filter } from '../enums/filters.enum';

/**
 *
 * @param property The parameter to interpret
 * @description Returns a TypeORM interpreted filter from either a StringFilterParam or a NumberFilterParam
 * @example
 * // both string parameter and enum parameter
 * getFilter(plainToClass(StringFilterParam, parameter));
 * // reserved to number parameter
 * getFilter(plainToClass(NumberFilterParam, parameter));
 */
export function getFilter(property: StringFilterParam): FindOperator<string>;
export function getFilter(property: NumberFilterParam): FindOperator<number>;
export function getFilter(
  property: StringFilterParam | NumberFilterParam,
): FindOperator<string> | FindOperator<number> {
  if (property instanceof StringFilterParam) {
    switch (property.filter) {
      case 'isnull':
        return IsNull();
      case 'not':
        return Not(In(property.criterias));
      default:
        return In(property.criterias);
    }
  } else if (property instanceof NumberFilterParam) {
    switch (property.filter) {
      case 'isnull':
        return IsNull();
      case 'not':
        return Not(In(property.criterias.map((c) => Number(c))));
      case 'lessthan':
        return LessThan(Number(property.criterias[0]));
      case 'lessthanorequal':
        return LessThanOrEqual(Number(property.criterias[0]));
      case 'morethan':
        return MoreThan(Number(property.criterias[0]));
      case 'morethanorequal':
        return MoreThanOrEqual(Number(property.criterias[0]));
      default:
        return In(property.criterias.map((c) => Number(c)));
    }
  }
}

export class StringFilterParam {
  @IsOptional()
  @IsEnum(Filter)
  public filter: string;

  @IsArray()
  @IsNotEmpty()
  @ArrayUnique()
  public criterias: string[];
}

export class NumberFilterParam {
  @IsOptional()
  @IsEnum(Filter)
  public filter: string;

  @IsArray()
  @IsNotEmpty()
  @IsNumberString({}, { each: true })
  @ArrayUnique()
  public criterias: string[];
}

/**
 * @param property The enumeration beeing validated
 * @description Return a new class setup to validate on the passed enumeration type
 * @example
 * // Create your EnumFilter
 * const YourEnumFiler = createEnumFilterParam<YourEnum>(YourEnum);
 *
 * // Use it like this
 * // Note: Backticks are used to prevent JSDoc for badly parsing the decorators, remove them in your code
 * `@IsOptional()`
 * `@ValidateNested()`
 * `@Type(() => ContractFilterParam)`
 * public contractType: any;
 */
export function createEnumFilterParam<T>(type: Object) {
  class EnumFilterParam {
    @IsOptional()
    @IsEnum(Filter)
    public filter: string;

    @IsArray()
    @IsNotEmpty()
    @IsEnum(type, { each: true })
    @ArrayUnique()
    public criterias: T[];
  }

  return EnumFilterParam;
}
