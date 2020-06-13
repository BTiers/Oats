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
    /**
     * @swagger
     * definitions:
     *  User:
     *    description: Representation of a User entity
     *    properties:
     *      id:
     *        type: number
     *        description: Database identifier of the user
     *      name:
     *        type: string
     *        description: Complete name of the user
     *      email:
     *        type: string
     *        description: Email of the user
     *      slug:
     *        type: string
     *        description: Serverside generated slug
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
     *      name:
     *        type: string
     *        description: Complete name of the user
     *      email:
     *        type: string
     *        description: Email of the user
     *      slug:
     *        type: string
     *        description: Serverside generated slug
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
     * 
     * /users:
     *  get:
     *    summary: All Users
     *    description: Get the complete list of registered users
     *    security:
     *      - bearerAuth: []
     *    tags:
     *      - Users (Authenticated only)
     *    responses:
     *      200:
     *        description: The list of users
     *        schema:
     *          type: array
     *          items:
     *            $ref: '#/definitions/User'
     *      401:
     *        description: Wrong authentication token
     *      500:
     *        description: Internal Server Error
     */
    this.router.get(`${this.path}`, authMiddleware, this.getAllUsers);

    /**
     * @swagger
     * 
     * /users/current:
     *  get:
     *    summary: Current User
     *    description: Get the currently logged in user
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
    this.router.get(`${this.path}/current`, authMiddleware, this.getCurrentUser);

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
      response.send(user);
    } else {
      next(new UserNotFoundException(user.id));
    }
  };

  private getUserBySlug = async (request: Request, response: Response, next: NextFunction) => {
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
