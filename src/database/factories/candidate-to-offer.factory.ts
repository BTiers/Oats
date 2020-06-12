import * as Faker from 'faker';
import { define } from 'typeorm-seeding';

import ProcessStatus from '../../enums/process-status.enum';

import Candidate from '../../candidate/candidate.entity';
import Offer from '../../offer/offer.entity';
import CandidateToOffer from '../../candidate/offer/candidate-to-offer.entity';

define(CandidateToOffer, (
  faker: typeof Faker,
  { offer, candidate }: { offer: Offer; candidate: Candidate },
) => {
  const candidateOffer = new CandidateToOffer();

  candidateOffer.candidate = candidate;
  candidateOffer.offer = offer;

  candidateOffer.status = ProcessStatus.Waiting;

  return candidateOffer;
});
