import User from '../user/user.interface';
import Client from '../client/client.interface';
import CandidateToOffer from '../candidate/offer/candidate-to-offer.entity';

interface Offer {
  id: number;
  job: string;
  annualSalary: number;
  referrer: User;
  owner: Client;
  candidates: CandidateToOffer[];
}

export default Offer;
