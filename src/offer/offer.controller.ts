import { Router, Request, Response, NextFunction } from 'express';
import { getRepository, FindManyOptions, Not } from 'typeorm';
import { plainToClass } from 'class-transformer';

import Controller from '../shared/interfaces/controller.interface';
import { PaginationMetadata } from '../shared/interfaces/pagination.interface';

import authMiddleware from '../middleware/auth.middleware';
import queryValidationMiddleware from '../middleware/query-validation.middleware';

import Offer from './offer.entity';
import { FilterOfferParams } from './offer.dto';

import OfferNotFoundException from '../exceptions/OfferNotFoundException';
import NoOffersFoundException from '../exceptions/NoOffersFoundException';
import ExceededPageIndexException from '../exceptions/ExceededPageIndexException';

import {
  getFilter,
  StringFilterParam,
  NumberFilterParam,
} from '../shared/validators/filters.validator';

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
     *    parameters:
     *      - in: query
     *        name: page
     *        schema:
     *          type: integer
     *          default: 0
     *        description: The page position (page * perPage).
     *      - in: query
     *        name: perPage
     *        schema:
     *          type: integer
     *          minimum: 1
     *          maximum: 100
     *          default: 20
     *        description: The number of items retrieved on each pages.
     *      - in: header
     *        name: Authorization
     *        schema:
     *          description: The server set HTTPOnly cookie
     *          type: string
     *      - in: header
     *        name: x-xsrf-token
     *        schema:
     *          description: The XSRFToken to refresh
     *          type: string
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
    this.router.get(
      `${this.path}`,
      [authMiddleware, queryValidationMiddleware(FilterOfferParams)],
      this.getAllOffers,
    );

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
     *      - in: header
     *        name: Authorization
     *        schema:
     *          description: The server set HTTPOnly cookie
     *          type: string
     *      - in: header
     *        name: x-xsrf-token
     *        schema:
     *          description: The XSRFToken to refresh
     *          type: string
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

  private removeEmpty = <T>(obj: FindManyOptions<T>): FindManyOptions<T> =>
    Object.fromEntries(
      Object.entries(obj)
        .filter(([k, v]) => v !== undefined)
        .map(([k, v]) => (typeof v === 'object' && !v._type ? [k, this.removeEmpty(v)] : [k, v]))
        .filter(([k, v]) => Object.keys(v).length),
    );

  private buildFieldsOptions = (filters: FilterOfferParams): FindManyOptions<Offer> => {
    const { job, annualSalary, contractType } = filters;
    const { order } = filters;

    const options: FindManyOptions<Offer> = {
      where: {
        job: getFilter(plainToClass(StringFilterParam, job)),
        annualSalary: getFilter(plainToClass(NumberFilterParam, annualSalary)),
        contractType: getFilter(plainToClass(StringFilterParam, contractType)),
      },
      order: order,
    };

    return this.removeEmpty(options);
  };

  private getAllOffers = async (request: Request, response: Response, next: NextFunction) => {
    let { perPage = 20, page = 0 } = request.query; // Pagination related queryParams
    //    const { q: fullTextSearch } = request.query; // Full text search related query Params

    perPage = Number(perPage);
    page = Number(page);

    const take = perPage;
    const skip = page * take;

    const filterOptions = this.buildFieldsOptions((request.query as unknown) as FilterOfferParams);

    const total = await this.offerRepository.count(filterOptions);
    const pageCount = Math.ceil(total / take);

    if (total === 0) return next(new NoOffersFoundException('No offers are available'));

    if (page > pageCount)
      return next(
        new ExceededPageIndexException(
          `Page n°${page} cannot be found with ${perPage} items per page.
          Last available page can be retrieved here:
          /offers?page=${pageCount - 1}&perPage=${perPage}`,
        ),
      );

    const offers = await this.offerRepository.find({
      relations: ['owner', 'referrer'],
      ...filterOptions,
      take,
      skip,
    });

    if (offers && offers.length) {
      const metadata: PaginationMetadata = {
        page: page,
        perPage: take,
        pageCount,
        totalItems: total,
        links: {
          self: `/offers?page=${page}&perPage=${perPage}`,
          first: `/offers?page=0&perPage=${perPage}`,
          previous: page === 0 ? null : `/offers?page=${page - 1}&perPage=${perPage}`,
          next: page + 1 >= pageCount ? null : `/offers?page=${page + 1}&perPage=${perPage}`,
          last: `/offers?page=${pageCount > 0 ? pageCount - 1 : pageCount}&perPage=${perPage}`,
        },
      };

      response.send({ offers, metadata });
    } else {
      next(new NoOffersFoundException('No offers are available with current filters'));
    }
  };
}

export default OfferController;
