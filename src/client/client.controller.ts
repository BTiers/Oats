import { Router, Request, Response, NextFunction } from 'express';
import { getRepository, FindManyOptions } from 'typeorm';
import { plainToClass } from 'class-transformer';

import slugify from 'slugify';

import Controller from '../shared/interfaces/controller.interface';
import { PaginationMetadata } from '../shared/interfaces/pagination.interface';

import authenticationMiddleware from '../middleware/authentication.middleware';
import validationMiddleware from '../middleware/validation.middleware';
import queryValidationMiddleware from '../middleware/query-validation.middleware';

import Client from './client.entity';
import User from '../user/user.entity';

import { CreateClientDto, ClientFilterParams } from './client.dto';

import ClientNotFoundException from '../exceptions/ClientNotFoundException';
import UserNotFoundException from '../exceptions/UserNotFoundException';
import ClientAlreadyExistsException from '../exceptions/ClientAlreadyExistsException';
import NoClientFoundException from '../exceptions/NoClientsFoundException';
import ExceededPageIndexException from '../exceptions/ExceededPageIndexException';

import { getFilter, StringFilterParam } from '../shared/validators/filters.validator';
import Pagination from '../shared/class/pagination';

import removeEmptyObjectEntries from '../utils/removeEmptyObjectEntries';
import getFilterParams from '../utils/getFilterParams';

class ClientController implements Controller {
  public path = '/clients';
  public router = Router();

  private clientRepository = getRepository(Client);
  private userRepository = getRepository(User);

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    /**
     * @swagger
     * definitions:
     *  Client:
     *    description: Representation of a Client entity
     *    properties:
     *      id:
     *        type: number
     *        description: Database identifier of the client
     *      name:
     *        type: string
     *        description: Company name of the client
     *      phone:
     *        type: string
     *        description: Phone number of the client
     *      slug:
     *        type: string
     *        description: Serverside generated slug
     *      createdDate:
     *        type: string
     *        description: Creation date of the client, can be parsed into a JS Date object
     *      updatedDate:
     *        type: string
     *        description: Last update date of the client, can be parsed into a JS Date object
     *      offerCount:
     *        type: number
     *        description: Number of offers the client currently have
     */

    /**
     * @swagger
     * definitions:
     *  ClientWithRelations:
     *    description: Representation of a Client entity with Offers & User relations
     *    properties:
     *      id:
     *        type: number
     *        description: Database identifier of the client
     *      name:
     *        type: string
     *        description: Company name of the client
     *      phone:
     *        type: string
     *        description: Phone number of the client
     *      slug:
     *        type: string
     *        description: Serverside generated slug
     *      createdDate:
     *        type: string
     *        description: Creation date of the client, can be parsed into a JS Date object
     *      updatedDate:
     *        type: string
     *        description: Last update date of the client, can be parsed into a JS Date object
     *      offers:
     *        type: array
     *        description: Offers of the client
     *        items:
     *          $ref: '#/definitions/Offer'
     *      accountManager:
     *        $ref: '#/definitions/User'
     *      offerCount:
     *        type: number
     *        description: Number of offers the client currently have
     */

    /**
     * @swagger
     * /clients:
     *  get:
     *    summary: All Clients
     *    description: Get a list of all clients
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
     *          "<strong>Example:</strong> <code>name[filter]=equal&name[criterias][]=Crooks&name[criterias][]=Lindgren</code><br/><br/>
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
     *      - Clients (Authenticated only)
     *    responses:
     *      200:
     *        description: All the clients
     *        schema:
     *          type: object
     *          properties:
     *            clients:
     *              $ref: '#/definitions/Client'
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
      [authenticationMiddleware, queryValidationMiddleware(ClientFilterParams)],
      this.getAll,
    );

    /**
     * @swagger
     *
     * /clients/{slug}:
     *  get:
     *    summary: Client by slug
     *    description: Get the client represented by the given slug
     *    security:
     *      - bearerAuth: []
     *    tags:
     *      - Clients (Authenticated only)
     *    parameters:
     *      - in: path
     *        name: slug
     *        schema:
     *          type: string
     *        required: true
     *        description: Slug of the Client to get
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
     *        description: Client with {slug}
     *        schema:
     *          $ref: '#/definitions/ClientWithRelations'
     *      401:
     *        description: Wrong authentication token
     *        schema:
     *          $ref: '#/definitions/HTTPError'
     *      404:
     *        description: No client found
     *        schema:
     *          $ref: '#/definitions/HTTPError'
     *      500:
     *        description: Internal Server Error
     *        schema:
     *          $ref: '#/definitions/HTTPError'
     */
    this.router.get(`${this.path}/:slug`, authenticationMiddleware, this.getOne);

    /**
     * @swagger
     *
     * /clients:
     *  post:
     *    summary: Create a Client
     *    description: Create a Client with the provided informations
     *    security:
     *      - bearerAuth: []
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
     *    tags:
     *      - Clients (Authenticated only)
     *    requestBody:
     *      content:
     *        application/json:
     *          schema:
     *            type: object
     *            properties:
     *              name:
     *                type: string
     *                description: The client name
     *                required: true
     *              phone:
     *                type: string
     *                description: The client phone number
     *                required: true
     *              accountManager:
     *                type: string
     *                description: The client accountManager, must be a valid User slug
     *                required: true
     *    responses:
     *      200:
     *        description: Newly created Client
     *        schema:
     *          type: object
     *          $ref: '#/definitions/Client'
     *      400:
     *        description: Client already exist
     *        schema:
     *          $ref: '#/definitions/HTTPError'
     *      401:
     *        description: Wrong authentication token
     *        schema:
     *          $ref: '#/definitions/HTTPError'
     *      404:
     *        description: No user found (Thrown when accountManager key does not represent a valid user)
     *        schema:
     *          $ref: '#/definitions/HTTPError'
     *      500:
     *        description: Internal Server Error
     *        schema:
     *          $ref: '#/definitions/HTTPError'
     */
    this.router.post(
      `${this.path}`,
      [validationMiddleware(CreateClientDto), authenticationMiddleware],
      this.postClient,
    );

    /**
     * @swagger
     *
     * /clients/{slug}:
     *  delete:
     *    summary: Delete a Client
     *    description: Delete the client represented by {slug}
     *    security:
     *      - bearerAuth: []
     *    parameters:
     *      - in: path
     *        name: slug
     *        schema:
     *          type: string
     *        required: true
     *        description: Slug of the Client to delete
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
     *      - Clients (Authenticated only)
     *    responses:
     *      200:
     *        description: Client succesfully deleted
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
    this.router.delete(`${this.path}/:slug`, authenticationMiddleware, this.deleteClient);
  }

  private getOne = async (request: Request, response: Response, next: NextFunction) => {
    const slug = request.params.slug;
    const client = await this.clientRepository.findOne(
      { slug },
      { relations: ['offers', 'accountManager'] },
    );

    if (client) {
      response.send(client);
    } else {
      next(new ClientNotFoundException(slug));
    }
  };

  private buildFieldsOptions = (filters: ClientFilterParams): FindManyOptions<Client> => {
    const { name } = filters;
    const { order } = filters;

    const options: FindManyOptions<Client> = {
      where: {
        name: getFilter(plainToClass(StringFilterParam, name)),
      },
      order: order,
    };

    return removeEmptyObjectEntries(options);
  };

  private getAll = async (request: Request, response: Response, next: NextFunction) => {
    let { perPage = 20, page = 0 } = request.query; // Pagination related queryParams
    //    const { q: fullTextSearch } = request.query; // Full text search related query Params

    const filterOptions = this.buildFieldsOptions((request.query as unknown) as ClientFilterParams);

    const total = await this.clientRepository.count(filterOptions);
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

    const clients = await this.clientRepository.find({
      ...filterOptions,
      take: pagination.take,
      skip: pagination.skip,
    });

    if (clients && clients.length) response.send({ clients, metadata: pagination.metadata });
    else next(new NoClientFoundException('No clients are available with current filters'));
  };

  private postClient = async (request: Request, response: Response, next: NextFunction) => {
    const clientData: CreateClientDto = request.body;

    const client = await this.clientRepository.findOne({
      slug: slugify(clientData.name, { lower: true }),
    });

    if (!client) {
      const accountManager = await this.userRepository.findOne({ slug: clientData.accountManager });

      if (!accountManager) {
        next(new UserNotFoundException(clientData.accountManager));
        return;
      }

      const newClient = this.clientRepository.create({
        ...clientData,
        offerCount: 0,
        accountManager,
      });

      await this.clientRepository.save(newClient);
      response.send(newClient);
    } else next(new ClientAlreadyExistsException(clientData.name, client));
  };

  private deleteClient = async (request: Request, response: Response, next: NextFunction) => {
    const slug = request.params.slug;
    const client = await this.clientRepository.findOne({ slug });

    if (client) {
      const result = await this.clientRepository.delete({ slug });
      console.log(result);
      response.status(200).send();
    } else {
      next(new ClientNotFoundException(slug));
    }
  };
}

export default ClientController;
