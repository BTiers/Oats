import {
  IsString,
  IsPhoneNumber,
  ValidateNested,
  IsDefined,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

import { Order } from '../shared/enums/order.enum';
import { Pagination } from '../shared/validators/pagination.validator';
import { StringFilterParam } from '../shared/validators/filters.validator';
import { UserFilterParam } from '../shared/validators/user.validator';

export class CreateClientDto {
  @IsDefined()
  @IsString()
  public name: string;

  @IsDefined()
  @IsPhoneNumber('FR')
  public phone: string;

  @IsDefined()
  @IsString()
  public accountManager!: string;
}

class ClientOrderParams {
  @IsOptional()
  @IsEnum(Order)
  public name: Order;
}

export class ClientFilterParams extends Pagination {
  @IsOptional()
  @ValidateNested()
  @Type(() => StringFilterParam)
  public name: StringFilterParam;

  @IsOptional()
  @ValidateNested()
  @Type(() => UserFilterParam)
  public accountManager: UserFilterParam;

  @IsOptional()
  @ValidateNested()
  @Type(() => ClientOrderParams)
  public order: ClientOrderParams;
}
