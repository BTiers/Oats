import { Router, Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import Controller from '../interfaces/controller.interface';

import authMiddleware from '../middleware/auth.middleware';

import Candidate from './candidate.entity';

import CandidateNotFoundException from '../exceptions/CandidateNotFoundException';
import NoCandidatesFoundException from '../exceptions/NoCandidatesFoundException';

class CandidateController implements Controller {
  public path = '/candidates';
  public router = Router();

  private candidateRepository = getRepository(Candidate);

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}`, authMiddleware, this.getAllCandidate);
    this.router.get(`${this.path}/:slug`, authMiddleware, this.getCandidateBySlug);
  }

  private getAllCandidate = async (request: Request, response: Response, next: NextFunction) => {
    const candidates = await this.candidateRepository.find({ relations: ['referrer'] });

    if (candidates && candidates.length) {
      response.send(candidates);
    } else {
      next(new NoCandidatesFoundException());
    }
  };

  private getCandidateBySlug = async (request: Request, response: Response, next: NextFunction) => {
    const slug = request.params.slug;
    const candidate = await this.candidateRepository.findOne(
      { slug },
      { relations: ['processes', 'processes.offer', 'referrer', 'interviews'] },
    );

    if (candidate) {
      response.send(candidate);
    } else {
      next(new CandidateNotFoundException(slug));
    }
  };
}

export default CandidateController;
