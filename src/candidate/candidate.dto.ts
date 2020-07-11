import {
  IsString,
  ValidateNested,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

import { Order } from '../shared/enums/order.enum';
import { Pagination } from '../shared/validators/pagination.validator';
import { StringFilterParam } from '../shared/validators/filters.validator';
import { UserFilterParam } from '../shared/validators/user.validator';

export class CreateCandidateDto {
  @IsString()
  public name: string;

  @IsString()
  public email: string;

  @IsString()
  public resume: string;
}

class CandidateOrderParams {
  @IsOptional()
  @IsEnum(Order)
  public name: Order;

  @IsOptional()
  @IsEnum(Order)
  public email: Order;
}

export class CandidateFilterParams extends Pagination {
  @IsOptional()
  @ValidateNested()
  @Type(() => StringFilterParam)
  public name: StringFilterParam;

  @IsOptional()
  @ValidateNested()
  @Type(() => StringFilterParam)
  public email: StringFilterParam;

  @IsOptional()
  @ValidateNested()
  @Type(() => UserFilterParam)
  public accountManager: UserFilterParam;

  @IsOptional()
  @ValidateNested()
  @Type(() => CandidateOrderParams)
  public order: CandidateOrderParams;
}

