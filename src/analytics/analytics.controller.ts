import { Router, Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import Controller from '../shared/interfaces/controller.interface';

import authMiddleware from '../middleware/auth.middleware';

import Candidate from '../candidate/candidate.entity';
import Client from '../client/client.entity';

import NoCandidatesFoundException from '../exceptions/NoCandidatesFoundException';
import NoClientsFoundException from '../exceptions/NoCandidatesFoundException';

class AnalyticsController implements Controller {
  public path = '/analytics';
  public router = Router();

  private candidateRepository = getRepository(Candidate);
  private clientRepository = getRepository(Client);

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(
      `${this.path}/candidate-acquisition-over-time`,
      authMiddleware,
      this.getCandidateAcquisitionOverTime,
    );
    this.router.get(
      `${this.path}/client-acquisition-over-time`,
      authMiddleware,
      this.getClientAcquisitionOverTime,
    );
  }

  private getCandidateAcquisitionOverTime = async (
    request: Request,
    response: Response,
    next: NextFunction,
  ) => {
    const candidates = await this.candidateRepository
      .createQueryBuilder('candidate')
      .select("DATE_TRUNC('day', candidate.createdDate)")
      .addSelect('COUNT(candidate.id)')
      .groupBy("DATE_TRUNC('day', candidate.createdDate)")
      .getRawMany();

    if (candidates && candidates.length) {
      response.send(candidates);
    } else {
      next(new NoCandidatesFoundException());
    }
  };

  private getClientAcquisitionOverTime = async (
    request: Request,
    response: Response,
    next: NextFunction,
  ) => {
    const clients = await this.clientRepository
      .createQueryBuilder('client')
      .select("DATE_TRUNC('day', client.createdDate)")
      .addSelect('COUNT(client.id)', 'count')
      .groupBy("DATE_TRUNC('day', client.createdDate)")
      .getRawMany();

    if (clients && clients.length) {
      response.send(clients);
    } else {
      next(new NoClientsFoundException());
    }
  };
}

export default AnalyticsController;
