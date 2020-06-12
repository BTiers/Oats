import * as Faker from 'faker';
import { define } from 'typeorm-seeding';

import Client from '../../client/client.entity';
import User from '../../user/user.entity';

define(Client, (faker: typeof Faker, accountManager: User) => {
  const name = faker.company.companyName();
  const phone = faker.phone.phoneNumber('06########');

  const client = new Client();

  client.name = name;
  client.phone = phone;
  client.accountManager = accountManager;

  return client;
});
