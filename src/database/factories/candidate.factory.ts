import * as Faker from 'faker';
import { define } from 'typeorm-seeding';

import Candidate from '../../candidate/candidate.entity';
import User from '../../user/user.entity';

define(Candidate, (faker: typeof Faker, { referrer }: { referrer: User }) => {
  const firstName = faker.name.firstName();
  const lastName = faker.name.lastName();

  const name = `${firstName} ${lastName}`;
  const email = faker.internet.email(firstName, lastName);

  const candidate = new Candidate();

  candidate.name = name;
  candidate.email = email;
  candidate.resume = faker.lorem.paragraph();

  candidate.referrer = referrer;

  return candidate;
});
