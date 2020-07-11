import { IsOptional, Max, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class Pagination {
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  public perPage: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  public page: number;
}