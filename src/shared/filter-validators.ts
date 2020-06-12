import FilterType from "../enums/filter-options.enum";
import { IsEnum, IsString, IsDefined, IsBooleanString, IsNumberString } from "class-validator";

export class FilterOptionInteger {
  @IsDefined()
  @IsBooleanString()
  public active: Boolean;

  @IsDefined()
  @IsEnum(FilterType)
  public filter: String;

  @IsDefined()
  @IsNumberString()
  public criteria: Number;
};

export class FilterOptionString {
  @IsDefined()
  @IsBooleanString()
  public active: Boolean;

  @IsDefined()
  @IsEnum(FilterType)
  public filter: String;

  @IsDefined()
  @IsString()
  public criteria: String;
};