import { Router, Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import Controller from '../interfaces/controller.interface';

import authMiddleware from '../middleware/auth.middleware';

import User from './user.entity';

import UserNotFoundException from '../exceptions/UserNotFoundException';
import NoUsersFoundException from '../exceptions/NoUsersFoundException';

import RequestWithUser from 'interfaces/requestWithUser.interface';

class UserController implements Controller {
  public path = '/users';
  public router = Router();

  private userRepository = getRepository(User);

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}`, authMiddleware, this.getAllUsers);
    this.router.get(`${this.path}/current`, authMiddleware, this.getCurrentUser);
    this.router.get(`${this.path}/:slug`, authMiddleware, this.getUserBySlug);
  }

  private getAllUsers = async (request: Request, response: Response, next: NextFunction) => {
    const users = await this.userRepository.find();

    if (users && users.length) {
      response.send(users);
    } else {
      next(new NoUsersFoundException());
    }
  };

  private getCurrentUser = async (
    request: RequestWithUser,
    response: Response,
    next: NextFunction,
  ) => {
    const { user } = request;

    if (user) {
      response.send({ ...user, password: null });
    } else {
      next(new UserNotFoundException(user.id));
    }
  };

  private getUserBySlug = async (request: Request, response: Response, next: NextFunction) => {
    const slug = request.params.slug;
    const user = await this.userRepository.findOne({ slug }, { relations: ['offers', 'clients'] });

    if (user) {
      response.send({ ...user, password: null });
    } else {
      next(new UserNotFoundException(slug));
    }
  };
}

export default UserController;
