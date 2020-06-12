import CandidateToOffer from './offer/candidate-to-offer.entity';

interface Candidate {
  id: number;
  name: string;
  email: string;
  resume: string;

  processes: CandidateToOffer[];
}

export default Candidate;
