import { Router, Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';
import slugify from 'slugify';

import Controller from '../interfaces/controller.interface';

import authMiddleware from '../middleware/auth.middleware';
import validationMiddleware from '../middleware/validation.middleware';
import queryValidationMiddleware from '../middleware/query-validation.middleware';

import Client from './client.entity';
import User from '../user/user.entity';

import filterToSQL from '../shared/filter-to-sql';
import criteriaToSQL from '../shared/criteria-to-sql';

import { CreateClientDto, FilterClientDto } from './client.dto';

import ClientNotFoundException from '../exceptions/ClientNotFoundException';
import NoClientFoundException from '../exceptions/NoClientsFoundException';
import UserNotFoundException from '../exceptions/UserNotFoundException';
import ClientAlreadyExistsException from '../exceptions/ClientAlreadyExistsException';
import FilterType from 'enums/filter-options.enum';

class ClientController implements Controller {
  public path = '/clients';
  public router = Router();

  private clientRepository = getRepository(Client);
  private userRepository = getRepository(User);

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(
      `${this.path}`,
      [queryValidationMiddleware(FilterClientDto), authMiddleware],
      this.getAllClients,
    );
    this.router.get(`${this.path}/:slug`, authMiddleware, this.getClientBySlug);

    this.router.post(
      `${this.path}`,
      [validationMiddleware(CreateClientDto), authMiddleware],
      this.postClient,
    );
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
      let accountManager = undefined;

      if (clientData.accountManager) {
        accountManager = await this.userRepository.findOne({ slug: clientData.accountManager });

        if (!accountManager) {
          next(new UserNotFoundException(accountManager));
          return;
        }
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
}

export default ClientController;
