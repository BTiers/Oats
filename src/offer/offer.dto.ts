import { IsOptional, IsString, ValidateNested, IsNumber } from 'class-validator';

class CreateOfferDto {
  @IsString()
  public job: string;

  @IsNumber()
  public annualSalary: number;
}

export default CreateOfferDto;