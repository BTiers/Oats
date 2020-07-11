import * as Faker from 'faker';
import { define } from 'typeorm-seeding';
import User from '../../user/user.entity';

define(User, (faker: typeof Faker) => {
  const firstName = faker.name.firstName();
  const lastName = faker.name.lastName();

  const email = faker.internet.email(firstName, lastName);

  const user = new User();
  user.firstName = firstName;
  user.lastName = lastName;
  user.email = email;
  user.password = faker.random.word();

  console.log(user.email, user.firstName, user.lastName, user.password);

  return user;
});
