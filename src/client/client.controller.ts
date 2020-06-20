import { Router, Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';
import slugify from 'slugify';

import Controller from '../shared/interfaces/controller.interface';

import authMiddleware from '../middleware/auth.middleware';
import validationMiddleware from '../middleware/validation.middleware';
import queryValidationMiddleware from '../middleware/query-validation.middleware';

import Client from './client.entity';
import User from '../user/user.entity';

import filterToSQL from '../shared/filter-to-sql';
import criteriaToSQL from '../shared/criteria-to-sql';

import { CreateClientDto, FilterClientDto } from './client.dto';

import ClientNotFoundException from '../exceptions/ClientNotFoundException';
import UserNotFoundException from '../exceptions/UserNotFoundException';
import ClientAlreadyExistsException from '../exceptions/ClientAlreadyExistsException';
import FilterType from '../enums/filter-options.enum';

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

    this.router.get(
      `${this.path}`,
      [queryValidationMiddleware(FilterClientDto), authMiddleware],
      this.getAllClients,
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
    this.router.get(`${this.path}/:slug`, authMiddleware, this.getClientBySlug);

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
      [validationMiddleware(CreateClientDto), authMiddleware],
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
    this.router.delete(`${this.path}/:slug`, authMiddleware, this.deleteClient);
  }

  private async buildQueryFromFilters(filterOptions: FilterClientDto) {
    let query = this.clientRepository
      .createQueryBuilder('client')
      .select()
      .leftJoinAndSelect('client.offers', 'offers')
      .leftJoinAndSelect('client.accountManager', 'accountManager');

    Object.entries(filterOptions).forEach(
      (
        [key, value]: [
          String,
          {
            filter: FilterType;
            criteria: String;
          },
        ],
        index,
      ) => {
        if (index === 0)
          query = query.where(`client."${key}" ${filterToSQL(value.filter, index)}`, {
            [`criteria${index}`]: criteriaToSQL(value.filter, value.criteria),
          });
        else
          query = query.andWhere(`client."${key}" ${filterToSQL(value.filter, index)}`, {
            [`criteria${index}`]: criteriaToSQL(value.filter, value.criteria),
          });
      },
    );

    return query.getMany();
  }

  private getAllClients = async (request: Request, response: Response, next: NextFunction) => {
    const filterOptions: FilterClientDto = request.query;

    const clients = await this.buildQueryFromFilters(filterOptions);

    response.send(clients);
  };

  private getClientBySlug = async (request: Request, response: Response, next: NextFunction) => {
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
      console.log(result)
      response.status(200).send();
    } else {
      next(new ClientNotFoundException(slug));
    }
  };
}

export default ClientController;
