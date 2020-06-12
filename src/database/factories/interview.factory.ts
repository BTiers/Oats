import * as Faker from 'faker';
import { define, factory } from 'typeorm-seeding';

import User from '../../user/user.entity';
import Candidate from '../../candidate/candidate.entity';
import Interview from '../../candidate/interview/interview.entity';

define(Interview, (faker: typeof Faker, { candidate }: { candidate: Candidate }) => {
  const interview = new Interview();

  interview.comments = faker.lorem.paragraph();

  interview.candidate = candidate;
  interview.recruiter = candidate.referrer;

  return interview;
});
