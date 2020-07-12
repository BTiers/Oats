import { Router, Request, Response, NextFunction } from 'express';
import { getRepository, FindManyOptions } from 'typeorm';
import { plainToClass } from 'class-transformer';

import Controller from '../shared/interfaces/controller.interface';

import authenticationMiddleware from '../middleware/authentication.middleware';
import queryValidationMiddleware from '../middleware/query-validation.middleware';

import Candidate from './candidate.entity';

import { CandidateFilterParams } from './candidate.dto';

import CandidateNotFoundException from '../exceptions/CandidateNotFoundException';
import NoCandidatesFoundException from '../exceptions/NoCandidatesFoundException';
import ExceededPageIndexException from '../exceptions/ExceededPageIndexException';

import { StringFilterParam, getFilter } from '../shared/validators/filters.validator';
import Pagination from '../shared/class/pagination';

import removeEmptyObjectEntries from '../utils/removeEmptyObjectEntries';
import getFilterParams from '../utils/getFilterParams';

class CandidateController implements Controller {
  public path = '/candidates';
  public router = Router();

  private candidateRepository = getRepository(Candidate);

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    /**
     * @swagger
     * definitions:
     *  Candidate:
     *    description: Representation of a Candidate entity
     *    properties:
     *      id:
     *        type: number
     *        description: Database identifier of the candidate
     *      name:
     *        type: string
     *        description: Fullname of the candidate
     *      slug:
     *        type: string
     *        description: Serverside generated slug
     *      email:
     *        type: string
     *        description: Candidate email
     *      resume:
     *        type: string
     *        description: Dummy resume, ~30words of LoremIpsum
     *      createdDate:
     *        type: string
     *        description: Creation date of the candidate, can be parsed into a JS Date object
     *      updatedDate:
     *        type: string
     *        description: Last update date of the candidate, can be parsed into a JS Date object
     *      processCount:
     *        type: number
     *        description: Number of processes the candidate currently have
     *      interwiewCount:
     *        type: number
     *        description: Number of interview the candidate have been part of
     */

    /**
     * @swagger
     * definitions:
     *  CandidateWithReferrer:
     *    description: Representation of a Candidate entity with User relation
     *    properties:
     *      id:
     *        type: number
     *        description: Database identifier of the candidate
     *      name:
     *        type: string
     *        description: Fullname of the candidate
     *      slug:
     *        type: string
     *        description: Serverside generated slug
     *      email:
     *        type: string
     *        description: Candidate email
     *      resume:
     *        type: string
     *        description: Dummy resume, ~30words of LoremIpsum
     *      createdDate:
     *        type: string
     *        description: Creation date of the candidate, can be parsed into a JS Date object
     *      updatedDate:
     *        type: string
     *        description: Last update date of the candidate, can be parsed into a JS Date object
     *      referrer:
     *        $ref: '#/definitions/User'
     *      processCount:
     *        type: number
     *        description: Number of processes the candidate currently have
     *      interwiewCount:
     *        type: number
     *        description: Number of interview the candidate have been part of
     */

    /**
     * @swagger
     * definitions:
     *  CandidateWithRelations:
     *    description: WIP - Representation of a Candidate entity with User relation
     *    properties:
     *      id:
     *        type: number
     *        description: Database identifier of the candidate
     *      name:
     *        type: string
     *        description: Fullname of the candidate
     *      slug:
     *        type: string
     *        description: Serverside generated slug
     *      email:
     *        type: string
     *        description: Candidate email
     *      resume:
     *        type: string
     *        description: Dummy resume, ~30words of LoremIpsum
     *      createdDate:
     *        type: string
     *        description: Creation date of the candidate, can be parsed into a JS Date object
     *      updatedDate:
     *        type: string
     *        description: Last update date of the candidate, can be parsed into a JS Date object
     *      referrer:
     *        $ref: '#/definitions/User'
     *      processCount:
     *        type: number
     *        description: Number of processes the candidate currently have
     *      interwiewCount:
     *        type: number
     *        description: Number of interview the candidate have been part of
     */

    /**
     * @swagger
     * /candidates:
     *  get:
     *    summary: All Candidates
     *    description: Get a list of all candidates
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
     *        name: name
     *        schema:
     *          type: object
     *        description:
     *          "<strong>Example:</strong> <code>name[filter]=equal&name[criterias][]=John%22Doe&name[criterias][]=Jane%22Doe</code><br/><br/>
     *          <code>filter</code>: <code>enum</code> [ <code>equal</code>, <code>not</code>, <code>isnull</code> ]<br/>
     *          <i>Note</i> : If <code>isnull</code> is used, <code>criterias</code> is not expected to be present<br/><br/>
     *          <code>criterias</code>: <code>string[]</code>"
     *      - in: query
     *        name: email
     *        schema:
     *          type: object
     *        description:
     *          "<strong>Example:</strong> <code>email[filter]=equal&email[criterias][]=john.doe@gmail.com&email[criterias][]=jane.doe@gmail.com</code><br/><br/>
     *          <code>filter</code>: <code>enum</code> [ <code>equal</code>, <code>not</code>, <code>isnull</code> ]<br/>
     *          <i>Note</i> : If <code>isnull</code> is used, <code>criterias</code> is not expected to be present<br/><br/>
     *          <code>criterias</code>: <code>string[]</code>"
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
     *      - Candidates (Authenticated only)
     *    responses:
     *      200:
     *        description: All the candidates
     *        schema:
     *          type: object
     *          properties:
     *            candidates:
     *              $ref: '#/definitions/Candidate'
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
      [authenticationMiddleware, queryValidationMiddleware(CandidateFilterParams)],
      this.getAll,
    );

    /**
     * @swagger
     * /candidates/{slug}:
     *  get:
     *    summary: Candidate by slug
     *    description: Get the candidate represented by the given slug
     *    security:
     *      - bearerAuth: []
     *    tags:
     *      - Candidates (Authenticated only)
     *    parameters:
     *      - in: path
     *        name: slug
     *        schema:
     *          type: string
     *        required: true
     *        description: Slug of the Candidate to get
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
     *        description: Candidate with {slug}
     *        schema:
     *          $ref: '#/definitions/CandidateWithRelations'
     *      401:
     *        description: Wrong authentication token
     *        schema:
     *          $ref: '#/definitions/HTTPError'
     *      404:
     *        description: No candidate found
     *        schema:
     *          $ref: '#/definitions/HTTPError'
     *      500:
     *        description: Internal Server Error
     *        schema:
     *          $ref: '#/definitions/HTTPError'
     */
    this.router.get(`${this.path}/:slug`, authenticationMiddleware, this.getOne);
  }

  private getOne = async (request: Request, response: Response, next: NextFunction) => {
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

  private buildFieldsOptions = (filters: CandidateFilterParams): FindManyOptions<Candidate> => {
    const { name, email } = filters;
    const { order } = filters;

    const options: FindManyOptions<Candidate> = {
      where: {
        name: getFilter(plainToClass(StringFilterParam, name)),
        email: getFilter(plainToClass(StringFilterParam, email)),
      },
      order: order,
    };

    return removeEmptyObjectEntries(options);
  };

  private getAll = async (request: Request, response: Response, next: NextFunction) => {
    let { perPage = 20, page = 0 } = request.query; // Pagination related queryParams
    //    const { q: fullTextSearch } = request.query; // Full text search related query Params

    const filterOptions = this.buildFieldsOptions(
      (request.query as unknown) as CandidateFilterParams,
    );

    const total = await this.candidateRepository.count(filterOptions);
    const otherParams = getFilterParams(request.originalUrl, this.path);
    const pagination = new Pagination(this.path, Number(page), Number(perPage), total, otherParams);

    if (total === 0) {
      response.send({
        offers: [],
        metadata: pagination.metadata,
      });
      return;
    }

    if (pagination.exceedPageLimit)
      return next(new ExceededPageIndexException(pagination.exceedPageLimitHint));

    const candidates = await this.candidateRepository.find({
      ...filterOptions,
      take: pagination.take,
      skip: pagination.skip,
    });

    if (candidates && candidates.length)
      response.send({ candidates, metadata: pagination.metadata });
    else next(new NoCandidatesFoundException('No candidates are available with current filters'));
  };
}

export default CandidateController;
