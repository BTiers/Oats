import { Router, Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import Controller from '../interfaces/controller.interface';

import authMiddleware from '../middleware/auth.middleware';

import Offer from './offer.entity';

import OfferNotFoundException from '../exceptions/OfferNotFoundException';
import NoOffersFoundException from '../exceptions/NoOffersFoundException';

class OfferController implements Controller {
  public path = '/offers';
  public router = Router();

  private offerRepository = getRepository(Offer);

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}`, authMiddleware, this.getAllOffers);
    this.router.get(`${this.path}/:slug`, authMiddleware, this.getOfferBySlug);
  }

  private getOfferBySlug = async (request: Request, response: Response, next: NextFunction) => {
    const slug = request.params.slug;
    const offer = await this.offerRepository.findOne({ slug }, { relations: ['owner', 'referrer', 'candidates'] });

    if (offer) {
      response.send(offer);
    } else {
      next(new OfferNotFoundException(slug));
    }
  };

  private getAllOffers = async (request: Request, response: Response, next: NextFunction) => {
    const offers = await this.offerRepository.find({ relations: ['owner', 'referrer'] });

    if (offers && offers.length) {
      response.send(offers);
    } else {
      next(new NoOffersFoundException());
    }
  };
}

export default OfferController;
