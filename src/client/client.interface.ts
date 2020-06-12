import Offer from '../offer/offer.interface';

interface Client {
  id: number;
  name: string;
  phone: string;

  offers: Offer[];
}

export default Client;
