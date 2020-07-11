import { IsOptional, IsEnum, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

import { Pagination } from '../shared/validators/pagination.validator';
import { Order } from '../shared/enums/order.enum';
import Contract from '../shared/enums/contract.enum';
import {
  createEnumFilterParam,
  StringFilterParam,
  NumberFilterParam,
} from '../shared/validators/filters.validator';
import { UserFilterParam } from '../shared/validators/user.validator';

export const ContractFilterParam = createEnumFilterParam<Contract>(Contract);

class OfferOrderParams {
  @IsOptional()
  @IsEnum(Order)
  public job: Order;

  @IsOptional()
  @IsEnum(Order)
  public annualSalary: Order;

  @IsOptional()
  @IsEnum(Order)
  public contractType: Order;
}

export class OfferFilterParams extends Pagination {
  @IsOptional()
  @ValidateNested()
  @Type(() => StringFilterParam)
  public job: StringFilterParam;

  @IsOptional()
  @ValidateNested()
  @Type(() => NumberFilterParam)
  public annualSalary: NumberFilterParam;

  @IsOptional()
  @ValidateNested()
  @Type(() => ContractFilterParam)
  public contractType: any;

  @IsOptional()
  @ValidateNested()
  @Type(() => UserFilterParam)
  public referrer: UserFilterParam;

  @IsOptional()
  @ValidateNested()
  @Type(() => OfferOrderParams)
  public order: OfferOrderParams;
}
