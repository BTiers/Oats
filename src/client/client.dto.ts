import { IsString, IsPhoneNumber, ValidateNested, IsDefined } from 'class-validator';

import { FilterOptionString, FilterOptionInteger } from '../shared/filter-validators';
import { Type } from 'class-transformer';


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

export class FilterClientDto {
  @ValidateNested()
  @Type(() => FilterOptionString)
  public name: FilterOptionString;

  @ValidateNested()
  @Type(() => FilterOptionString)
  public phone: FilterOptionString;
}