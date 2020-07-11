import { Router, Request, Response, NextFunction } from 'express';
import { getRepository, FindManyOptions } from 'typeorm';
import { plainToClass } from 'class-transformer';

import Controller from '../shared/interfaces/controller.interface';
import RequestWithUser from '../shared/interfaces/request-with-user.interface';
import { PaginationMetadata } from '../shared/interfaces/pagination.interface';

import authenticationMiddleware from '../middleware/authentication.middleware';
import queryValidationMiddleware from '../middleware/query-validation.middleware';

import User from './user.entity';

import { UserFilterParams } from './user.dto';

import UserNotFoundException from '../exceptions/UserNotFoundException';
import NoUsersFoundException from '../exceptions/NoUsersFoundException';
import ExceededPageIndexException from '../exceptions/ExceededPageIndexException';

import { getFilter, StringFilterParam } from '../shared/validators/filters.validator';
import Pagination from '../shared/class/pagination';

import removeEmptyObjectEntries from '../utils/removeEmptyObjectEntries';
import getFilterParams from '../utils/getFilterParams';

class UserController implements Controller {
  public path = '/users';
  public router = Router();

  private userRepository = getRepository(User);

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    /**
     * @swagger
     * definitions:
     *  User:
     *    description: Representation of a User entity
     *    properties:
     *      id:
     *        type: number
     *        description: Database identifier of the user
     *      firstName:
     *        type: string
     *        description: Firstname of the user
     *      lastName:
     *        type: string
     *        description: Lastname of the user
     *      email:
     *        type: string
     *        description: Email of the user
     *      slug:
     *        type: string
     *        description: "Serverside generated slug (eg: firstname-lastname-shortid)"
     *      createdDate:
     *        type: string
     *        description: Creation date of the user, can be parsed into a JS Date object
     *      updatedDate:
     *        type: string
     *        description: Last update date of the user, can be parsed into a JS Date object
     *      offerCount:
     *        type: number
     *        description: Number of offers the user managed
     *      clientCount:
     *        type: number
     *        description: Number of client the user has under his responsability
     *      candidateCount:
     *        type: number
     *        description: Number of candidate the user has under his responsability
     */

    /**
     * @swagger
     * definitions:
     *  UserWithRelations:
     *    description: Representation of a User entity with Offer & Client relations
     *    properties:
     *      id:
     *        type: number
     *        description: Database identifier of the user
     *      firstName:
     *        type: string
     *        description: Firstname of the user
     *      lastName:
     *        type: string
     *        description: Lastname of the user
     *      email:
     *        type: string
     *        description: Email of the user
     *      slug:
     *        type: string
     *        description: "Serverside generated slug (eg: firstname-lastname-shortid)"
     *      createdDate:
     *        type: string
     *        description: Creation date of the user, can be parsed into a JS Date object
     *      updatedDate:
     *        type: string
     *        description: Last update date of the user, can be parsed into a JS Date object
     *      offerCount:
     *        type: number
     *        description: Number of offers the user managed
     *      clientCount:
     *        type: number
     *        description: Number of client the user has under his responsability
     *      candidateCount:
     *        type: number
     *        description: Number of candidate the user has under his responsability
     *      offers:
     *        type: array
     *        items:
     *          $ref: '#/definitions/Offer'
     *      clients:
     *        type: array
     *        items:
     *          $ref: '#/definitions/Client'
     */

    /**
     * @swagger
     * /clients:
     *  get:
     *    summary: All Users
     *    description: Get a list of all users
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
     *        name: firstName
     *        schema:
     *          type: object
     *        description:
     *          "<strong>Example:</strong> <code>firstName[filter]=equal&firstName[criterias][]=John&firstName[criterias][]=Jane</code><br/><br/>
     *          <code>filter</code>: <code>enum</code> [ <code>equal</code>, <code>not</code>, <code>isnull</code> ]<br/>
     *          <i>Note</i> : If <code>isnull</code> is used, <code>criterias</code> is not expected to be present<br/><br/>
     *          <code>criterias</code>: <code>string[]</code>"
     *      - in: query
     *        name: lastName
     *        schema:
     *          type: object
     *        description:
     *          "<strong>Example:</strong> <code>lastName[filter]=equal&lastName[criterias][]=Doe&lastName[criterias][]=Eod</code><br/><br/>
     *          <code>filter</code>: <code>enum</code> [ <code>equal</code>, <code>not</code>, <code>isnull</code> ]<br/>
     *          <i>Note</i> : If <code>isnull</code> is used, <code>criterias</code> is not expected to be present<br/><br/>
     *          <code>criterias</code>: <code>string[]</code>"
     *      - in: query
     *        name: email
     *        schema:
     *          type: object
     *        description:
     *          "<strong>Example:</strong> <code>email[filter]=equal&email[criterias][]=john.doe@gmail.com&email[criterias][]=jane.eod@gmail.com</code><br/><br/>
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
     *      - Users (Authenticated only)
     *    responses:
     *      200:
     *        description: All the users
     *        schema:
     *          type: object
     *          properties:
     *            clients:
     *              $ref: '#/definitions/User'
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
      [authenticationMiddleware, queryValidationMiddleware(UserFilterParams)],
      this.getAll,
    );

    /**
     * @swagger
     *
     * /users/current:
     *  get:
     *    summary: Current User
     *    description: Get the currently logged in user
     *    parameters:
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
     *    security:
     *      - bearerAuth: []
     *    tags:
     *      - Users (Authenticated only)
     *    responses:
     *      200:
     *        description: The current user
     *        schema:
     *          type: object
     *          $ref: '#/definitions/User'
     *      401:
     *        description: Wrong authentication token
     *      500:
     *        description: Internal Server Error
     */
    this.router.get(`${this.path}/current`, authenticationMiddleware, this.getCurrentUser);

    /**
     * @swagger
     *
     * /users/{slug}:
     *  get:
     *    summary: User by slug
     *    description: Get the user represented by the given slug
     *    security:
     *      - bearerAuth: []
     *    tags:
     *      - Users (Authenticated only)
     *    parameters:
     *      - in: path
     *        name: slug
     *        schema:
     *          type: string
     *        required: true
     *        description: Slug of the User to get
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
     *        description: User with {slug}
     *        schema:
     *          type: object
     *          $ref: '#/definitions/UserWithRelations'
     *      401:
     *        description: Wrong authentication token
     *        schema:
     *          $ref: '#/definitions/HTTPError'
     *      404:
     *        description: No user found
     *        schema:
     *          $ref: '#/definitions/HTTPError'
     *      500:
     *        description: Internal Server Error
     *        schema:
     *          $ref: '#/definitions/HTTPError'
     */
    this.router.get(`${this.path}/:slug`, authenticationMiddleware, this.getOne);
  }

  private buildFieldsOptions = (filters: UserFilterParams): FindManyOptions<User> => {
    const { firstName, lastName, email } = filters;
    const { order } = filters;

    const options: FindManyOptions<User> = {
      where: {
        firstName: getFilter(plainToClass(StringFilterParam, firstName)),
        lastName: getFilter(plainToClass(StringFilterParam, lastName)),
        email: getFilter(plainToClass(StringFilterParam, email)),
      },
      order: order,
    };

    return removeEmptyObjectEntries(options);
  };

  private getAll = async (request: Request, response: Response, next: NextFunction) => {
    let { perPage = 20, page = 0 } = request.query; // Pagination related queryParams
    //    const { q: fullTextSearch } = request.query; // Full text search related query Params

    const filterOptions = this.buildFieldsOptions((request.query as unknown) as UserFilterParams);

    const total = await this.userRepository.count(filterOptions);
    const otherParams = getFilterParams(request.originalUrl, this.path);
    const pagination = new Pagination(this.path, Number(page), Number(perPage), total, otherParams);

    if (total === 0) {
      response.send({
        offers: [],
        metadata: pagination.emptyMetadata,
      });
      return;
    }

    if (pagination.exceedPageLimit)
      return next(new ExceededPageIndexException(pagination.exceedPageLimitHint));

    const users = await this.userRepository.find({
      ...filterOptions,
      take: pagination.take,
      skip: pagination.skip,
    });

    if (users && users.length) response.send({ users, metadata: pagination.metadata });
    else next(new NoUsersFoundException('No users are available with current filters'));
  };

  private getCurrentUser = async (
    request: RequestWithUser,
    response: Response,
    next: NextFunction,
  ) => {
    const { user } = request;

    if (user) {
      response.send(user);
    } else {
      next(new UserNotFoundException(user.id));
    }
  };

  private getOne = async (request: Request, response: Response, next: NextFunction) => {
    const slug = request.params.slug;
    const user = await this.userRepository.findOne({ slug }, { relations: ['offers', 'clients'] });

    if (user) {
      response.send(user);
    } else {
      next(new UserNotFoundException(slug));
    }
  };
}

export default UserController;
