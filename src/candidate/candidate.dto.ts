import { IsOptional, IsString, ValidateNested } from 'class-validator';

class CreateCandidateDto {
  @IsString()
  public name: string;

  @IsString()
  public email: string;

  @IsString()
  public resume: string;
}

export default CreateCandidateDto;
