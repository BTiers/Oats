import {
  IsOptional,
  IsEnum,
  IsArray,
  IsNotEmpty,
  ArrayUnique,
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { getRepository, In } from 'typeorm';

import User from '../../user/user.entity';
import { Filter } from '../enums/filters.enum';

@ValidatorConstraint({ async: true })
export class IsUserSlugConstraint implements ValidatorConstraintInterface {
  async validate(usersSlugs: string[]) {
    const users = await getRepository(User).find({ where: { slug: In(usersSlugs) } });

    return users.length === usersSlugs.length;
  }
}

export function IsUserSlug(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsUserSlugConstraint,
    });
  };
}

export class UserFilterParam {
  @IsOptional()
  @IsEnum(Filter)
  public filter: string;

  @IsArray()
  @IsNotEmpty()
  @IsUserSlug({ message: 'Provided slugs does not match resources.' })
  @ArrayUnique()
  public criterias: string[];
}
