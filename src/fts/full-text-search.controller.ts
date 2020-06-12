import { Router, Request, Response, NextFunction } from 'express';
import { getRepository, Repository } from 'typeorm';

import Controller from '../interfaces/controller.interface';

import authMiddleware from '../middleware/auth.middleware';

import Client from '../client/client.entity';
import User from '../user/user.entity';
import Offer from '../offer/offer.entity';
import Candidate from '../candidate/candidate.entity';

class FTSController implements Controller {
  public path = '/full-text-search';
  public router = Router();

  private clientRepository = getRepository(Client);
  private userRepository = getRepository(User);
  private candidateRepository = getRepository(Candidate);
  private offerRepository = getRepository(Offer);

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}/:search`, authMiddleware, this.getFTSMatches);
  }

  private getFTS = async <T>(repository: Repository<T>, search: string): Promise<T[]> => {
    return repository
      .createQueryBuilder()
      .select()
      .limit(10)
      .where('"documentWithWeights" @@ to_tsquery(:query)', {
        query: `${search.trim().replace(/\s/g, ':* | ')}:*`,
      })
      .orderBy('ts_rank("documentWithWeights", to_tsquery(:query))', 'DESC')
      .getMany();
  };

  private getFTSMatches = async (request: Request, response: Response, next: NextFunction) => {
    const search = request.params.search;

    let clients: Client[] = [];
    let candidates: Candidate[] = [];
    let offers: Offer[] = [];
    let users: User[] = [];

    if (search) {
      [clients, candidates, offers, users] = await Promise.all([
        this.getFTS(this.clientRepository, search),
        this.getFTS(this.candidateRepository, search),
        this.getFTS(this.offerRepository, search),
        this.getFTS(this.userRepository, search),
      ]);
    }

    response.send({ clients, users, candidates, offers });
  };
}

export default FTSController;
