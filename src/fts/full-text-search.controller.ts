import { Router, Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';
import slugify from 'slugify';

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

  private getFTSMatches = async (request: Request, response: Response, next: NextFunction) => {
    const search = request.params.search;

    let clients: Client[] = [];
    let candidates: Candidate[] = [];
    let offers: Offer[] = [];
    let users: User[] = [];

    if (search) {
      clients = await this.clientRepository
        .createQueryBuilder()
        .select()
        .limit(10)
        .where('"documentWithWeights" @@ to_tsquery(:query)', {
          query: `${(search as String).trim().replace(/\s/g, ':* | ')}:*`,
        })
        .orderBy('ts_rank("documentWithWeights", to_tsquery(:query))', 'DESC')
        .getMany();

      candidates = await this.candidateRepository
        .createQueryBuilder()
        .select()
        .limit(10)
        .where('"documentWithWeights" @@ to_tsquery(:query)', {
          query: `${(search as String).trim().replace(/\s/g, ':* | ')}:*`,
        })
        .orderBy('ts_rank("documentWithWeights", to_tsquery(:query))', 'DESC')
        .getMany();

      offers = await this.offerRepository
        .createQueryBuilder()
        .select()
        .limit(10)
        .where('"documentWithWeights" @@ to_tsquery(:query)', {
          query: `${(search as String).trim().replace(/\s/g, ':* | ')}:*`,
        })
        .orderBy('ts_rank("documentWithWeights", to_tsquery(:query))', 'DESC')
        .getMany();

      users = await this.userRepository
        .createQueryBuilder()
        .select()
        .limit(10)
        .where('"documentWithWeights" @@ to_tsquery(:query)', {
          query: `${(search as String).trim().replace(/\s/g, ':* | ')}:*`,
        })
        .orderBy('ts_rank("documentWithWeights", to_tsquery(:query))', 'DESC')
        .getMany();
    }

    response.send({ clients, users, candidates, offers });
  };
}

export default FTSController;
