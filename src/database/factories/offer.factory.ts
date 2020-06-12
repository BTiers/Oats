import * as Faker from 'faker';
import { define, factory } from 'typeorm-seeding';

import Offer from '../../offer/offer.entity';
import Client from '../../client/client.entity';
import User from '../../user/user.entity';
import Candidate from 'candidate/candidate.entity';

define(Offer, (faker: typeof Faker, { owner, referrer }: { owner: Client; referrer: User }) => {
  const job = faker.name.jobTitle();
  const annualSalary = faker.random.number(120000);

  const offer = new Offer();

  offer.job = job;
  offer.annualSalary = annualSalary;

  offer.owner = owner;
  offer.referrer = referrer;

  return offer;
});
