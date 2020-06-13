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
    /**
     * @swagger
     * definitions:
     *  Offer:
     *    properties:
     *      id:
     *        type: number
     *        description: Database identifier of the offer
     *      job:
     *        type: string
     *        description: Job title
     *      slug:
     *        type: string
     *        description: Serverside generated slug
     *      annualSalary:
     *        type: number
     *        description: Annual salary of the offer
     *      contractType:
     *        type: string
     *        enum: [work_study, internship, permanent, fixed]
     *        description: Contract type of the offer
     *      createdDate:
     *        type: string
     *        description: Creation date of the offer, can be parsed into a JS Date object
     *      updatedDate:
     *        type: string
     *        description: Last update date of the offer, can be parsed into a JS Date object
     *      processCount:
     *        type: number
     *        description: Number of process that are related to this offer
     */

    /**
     * @swagger
     * definitions:
     *  OfferWithOwners:
     *    properties:
     *      id:
     *        type: number
     *        description: Database identifier of the offer
     *      job:
     *        type: string
     *        description: Job title
     *      slug:
     *        type: string
     *        description: Serverside generated slug
     *      annualSalary:
     *        type: number
     *        description: Annual salary of the offer
     *      contractType:
     *        type: string
     *        enum: [work_study, internship, permanent, fixed]
     *        description: Contract type of the offer
     *      createdDate:
     *        type: string
     *        description: Creation date of the offer, can be parsed into a JS Date object
     *      updatedDate:
     *        type: string
     *        description: Last update date of the offer, can be parsed into a JS Date object
     *      owner:
     *        $ref: '#/definitions/Client'
     *      referrer:
     *        $ref: '#/definitions/User'
     *      processCount:
     *        type: number
     *        description: Number of process that are related to this offer
     */

    /**
     * @swagger
     * definitions:
     *  OfferWithRelations:
     *    properties:
     *      id:
     *        type: number
     *        description: Database identifier of the offer
     *      job:
     *        type: string
     *        description: Job title
     *      slug:
     *        type: string
     *        description: Serverside generated slug
     *      annualSalary:
     *        type: number
     *        description: Annual salary of the offer
     *      contractType:
     *        type: string
     *        enum: [work_study, internship, permanent, fixed]
     *        description: Contract type of the offer
     *      createdDate:
     *        type: string
     *        description: Creation date of the offer, can be parsed into a JS Date object
     *      updatedDate:
     *        type: string
     *        description: Last update date of the offer, can be parsed into a JS Date object
     *      owner:
     *        $ref: '#/definitions/Client'
     *      referrer:
     *        $ref: '#/definitions/User'
     *      candidates:
     *        type: array
     *        description: It actually return CandidateToOffers
     *        items:
     *          type: string
     *      processCount:
     *        type: number
     *        description: Number of process that are related to this offer
     */

    /**
     * @swagger
     * 
     * /offers:
     *  get:
     *    summary: All Offers
     *    description: Get a list of all offers
     *    security:
     *      - bearerAuth: []
     *    tags:
     *      - Offers (Authenticated only)
     *    responses:
     *      200:
     *        description: All the offers
     *        schema:
     *          type: array
     *          items:
     *            $ref: '#/definitions/OfferWithOwners'
     *      401:
     *        description: Wrong authentication token
     *        schema:
     *          $ref: '#/definitions/HTTPError'
     *      500:
     *        description: Internal Server Error
     *        schema:
     *          $ref: '#/definitions/HTTPError'
     */
    this.router.get(`${this.path}`, authMiddleware, this.getAllOffers);

    /**
     * @swagger
     * 
     * /offers/{slug}:
     *  get:
     *    summary: Offer by slug
     *    description: Get the offer represented by the given slug
     *    security:
     *      - bearerAuth: []
     *    tags:
     *      - Offers (Authenticated only)
     *    parameters:
     *      - in: path
     *        name: slug
     *        schema:
     *          type: string
     *        required: true
     *        description: Slug of the Offer to get
     *    responses:
     *      200:
     *        description: Offer with {slug}
     *        schema:
     *          type: object
     *          $ref: '#/definitions/OfferWithRelations'
     *      401:
     *        description: Wrong authentication token
     *        schema:
     *          $ref: '#/definitions/HTTPError'
     *      404:
     *        description: No offer found
     *        schema:
     *          $ref: '#/definitions/HTTPError'
     *      500:
     *        description: Internal Server Error
     *        schema:
     *          $ref: '#/definitions/HTTPError'
     */
    this.router.get(`${this.path}/:slug`, authMiddleware, this.getOfferBySlug);
  }

  private getOfferBySlug = async (request: Request, response: Response, next: NextFunction) => {
    const slug = request.params.slug;
    const offer = await this.offerRepository.findOne(
      { slug },
      { relations: ['owner', 'referrer', 'candidates'] },
    );

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
