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

export class CreateUserDto {
  @IsString()
  public firstName: string;
  
  @IsString()
  public lastName: string;

  @IsString()
  public email: string;

  @IsString()
  public password: string;
}

class UserOrderParams {
  @IsOptional()
  @IsEnum(Order)
  public firstName: Order;

  @IsOptional()
  @IsEnum(Order)
  public lastName: Order;

  @IsOptional()
  @IsEnum(Order)
  public email: Order;
}

export class UserFilterParams extends Pagination {
  @IsOptional()
  @ValidateNested()
  @Type(() => StringFilterParam)
  public firstName: StringFilterParam;

  @IsOptional()
  @ValidateNested()
  @Type(() => StringFilterParam)
  public lastName: StringFilterParam;

  @IsOptional()
  @ValidateNested()
  @Type(() => StringFilterParam)
  public email: StringFilterParam;

  @IsOptional()
  @ValidateNested()
  @Type(() => UserOrderParams)
  public order: UserOrderParams;
}
