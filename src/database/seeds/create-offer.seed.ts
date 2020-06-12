import { Connection } from 'typeorm';
import { Factory, Seeder } from 'typeorm-seeding';

import Offer from '../../offer/offer.entity';
import User from '../../user/user.entity';
import Client from '../../client/client.entity';
import Candidate from '../../candidate/candidate.entity';
import CandidateToOffer from '../../candidate/offer/candidate-to-offer.entity';
import Interview from '../../candidate/interview/interview.entity';

export default class CreateOffers implements Seeder {
  public async run(factory: Factory, connection: Connection): Promise<any> {
    // Users
    const users = await factory(User)().createMany(10);

    // Clients
    const clients = await Promise.all(
      Array(20)
        .fill('_')
        .map(() => factory(Client)(users[Math.floor(Math.random() * 10)]).create()),
    );

    // Candidates
    const candidates = await Promise.all(
      Array(100)
        .fill('_')
        .map(() =>
          factory(Candidate)({
            referrer: users[Math.floor(Math.random() * 10)],
          }).create(),
        ),
    );

    // Interviews
    await Promise.all(
      Array(50)
        .fill('_')
        .map(() =>
          factory(Interview)({
            candidate: candidates[Math.floor(Math.random() * 100)],
          }).create(),
        ),
    );

    // Offers
    const offers = await Promise.all(
      Array(45)
        .fill('_')
        .map(() =>
          factory(Offer)({
            owner: clients[Math.floor(Math.random() * 20)],
            referrer: users[Math.floor(Math.random() * 10)],
          }).create(),
        ),
    );

    // Binding candidates to offers
    await Promise.all(
      Array(200)
        .fill('_')
        .map(() =>
          factory(CandidateToOffer)({
            offer: offers[Math.floor(Math.random() * 45)],
            candidate: candidates[Math.floor(Math.random() * 100)],
          }).create(),
        ),
    );
  }
}
