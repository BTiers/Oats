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

import removeEmptyObjectEntries from '../utils/removeEmptyObjectEntries';
import getFilterParams from '../utils/getFilterParams';

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
     *      - in: query
     *        name: job
     *        schema:
     *          type: object
     *        description:
     *          "<strong>Example:</strong> <code>job[filter]=equal&job[criterias][]=Director&job[criterias][]=Employee</code><br/><br/>
     *          <code>filter</code>: <code>enum</code> [ <code>equal</code>, <code>not</code>, <code>isnull</code> ]<br/>
     *          <i>Note</i> : If <code>isnull</code> is used, <code>criterias</code> is not expected to be present<br/><br/>
     *          <code>criterias</code>: <code>string[]</code>"
     *      - in: query
     *        name: annualSalary
     *        schema:
     *          type: object
     *        description:
     *          "<strong>Example:</strong> <code>annualSalary[filter]=equal&annualSalary[criterias][]=20000&annualSalary[criterias][]=50000</code><br/><br/>
     *          <code>filter</code>: <code>enum</code> [ <code>equal</code>, <code>not</code>, <code>isnull</code>, <code>lessthan</code>, <code>lessthanorequal</code>, <code>morethan</code>, <code>morethanorequal</code> ]<br/>
     *          <i>Note</i> : If <code>isnull</code> is used, <code>criterias</code> is not expected to be present<br/><br/>
     *          <code>criterias</code>: <code>number[]</code>"
     *      - in: query
     *        name: contractType
     *        schema:
     *          type: object
     *        description:
     *          "<strong>Example:</strong> <code>contractType[filter]=equal&contractType[criterias][]=internship&contractType[criterias][]=permanent</code><br/><br/>
     *          <code>filter</code>: <code>enum</code> [ <code>equal</code>, <code>not</code>, <code>isnull</code> ]<br/>
     *          <i>Note</i> : If <code>isnull</code> is used, <code>criterias</code> is not expected to be present<br/><br/>
     *          <code>criterias</code>: <code>enum[]</code> [ <code>work_study</code>, <code>internship</code>, <code>permanent</code>, <code>fixed</code> ]"
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
     *          type: object
     *          properties:
     *            offers:
     *              $ref: '#/definitions/OfferWithOwners'
     *            metadata:
     *              $ref: '#/definitions/PaginationMetadata'
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
      this.getAll,
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
    this.router.get(`${this.path}/:slug`, authMiddleware, this.getOne);
  }

  private getOne = async (request: Request, response: Response, next: NextFunction) => {
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

    return removeEmptyObjectEntries(options);
  };

  private getAll = async (request: Request, response: Response, next: NextFunction) => {
    let { perPage = 20, page = 0 } = request.query; // Pagination related queryParams
    //    const { q: fullTextSearch } = request.query; // Full text search related query Params

    perPage = Number(perPage);
    page = Number(page);

    const take = perPage;
    const skip = page * take;

    const filterOptions = this.buildFieldsOptions((request.query as unknown) as FilterOfferParams);

    const total = await this.offerRepository.count(filterOptions);
    const pageCount = Math.ceil(total / take);

    const otherParams = getFilterParams(request.originalUrl, this.path);

    if (total === 0) {
      response.send({
        offers: [],
        metadata: {
          page: 0,
          perPage,
          pageCount: 1,
          totalItems: 0,
          links: {
            self: `/offers?page=0&perPage=${perPage}${otherParams}`,
            first: `/offers?page=0&perPage=${perPage}${otherParams}`,
            previous: null,
            next: null,
            last: `/offers?page=0&perPage=${perPage}${otherParams}`,
          },
        },
      });
      return;
    }

    if (page > pageCount)
      return next(
        new ExceededPageIndexException(
          `Page n°${page} cannot be found with ${perPage} items per page.
          Last available page can be retrieved here:
          /offers?page=${pageCount - 1}&perPage=${perPage}${otherParams}`,
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
          self: `/offers?page=${page}&perPage=${perPage}${otherParams}`,
          first: `/offers?page=0&perPage=${perPage}${otherParams}`,
          previous: page === 0 ? null : `/offers?page=${page - 1}&perPage=${perPage}${otherParams}`,
          next: page + 1 >= pageCount ? null : `/offers?page=${page + 1}&perPage=${perPage}${otherParams}`,
          last: `/offers?page=${pageCount > 0 ? pageCount - 1 : pageCount}&perPage=${perPage}${otherParams}`,
        },
      };

      response.send({ offers, metadata });
    } else {
      next(new NoOffersFoundException('No offers are available with current filters'));
    }
  };
}

export default OfferController;
