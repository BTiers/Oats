import { Request, Response, NextFunction, Router } from 'express';
import * as bcrypt from 'bcrypt';

import { getRepository } from 'typeorm';

import Controller from '../interfaces/controller.interface';

import validationMiddleware from '../middleware/validation.middleware';

import AuthenticationService from './authentication.service';

import LogInDto from './logIn.dto';
import CreateUserDto from '../user/user.dto';

import User from '../user/user.entity';

import WrongCredentialsException from '../exceptions/WrongCredentialsException';

class AuthenticationController implements Controller {
  public path = '/authentication';
  public router = Router();

  private authenticationService = new AuthenticationService();
  private userRepository = getRepository(User);

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    /**
     * @swagger
     *
     * /authentication/register:
     *  post:
     *    summary: Register
     *    description: Register a new user to the application
     *    tags:
     *      - Authentication
     *    requestBody:
     *      content:
     *        application/json:
     *          schema:
     *            type: object
     *            properties:
     *              name:
     *                type: string
     *              email:
     *                type: string
     *              password:
     *                type: string
     *    responses:
     *      200:
     *        description: The Created User
     *        schema:
     *          type: object
     *          $ref: '#/definitions/User'
     *      401:
     *        description: Wrong Credentials Provided
     *      500:
     *        description: Internal Server Error
     */
    this.router.post(
      `${this.path}/register`,
      validationMiddleware(CreateUserDto),
      this.registration,
    );

    /**
     * @swagger
     *
     * /authentication/login:
     *  post:
     *    summary: Login
     *    description: Log a new user using the given credentials
     *    tags:
     *      - Authentication
     *    requestBody:
     *      content:
     *        application/json:
     *          schema:
     *            type: object
     *            properties:
     *              email:
     *                type: string
     *              password:
     *                type: string
     *    responses:
     *      200:
     *        description: The logged in User
     *        schema:
     *          type: object
     *          $ref: '#/definitions/User'
     *      401:
     *        description: Wrong Credentials Provided
     *      500:
     *        description: Internal Server Error
     */
    this.router.post(`${this.path}/login`, validationMiddleware(LogInDto), this.loggingIn);

    /**
     * @swagger
     *
     * /authentication/logout:
     *  post:
     *    summary: Logout
     *    description: Logout the currently logged user
     *    tags:
     *      - Authentication
     *    responses:
     *      200:
     *        description: Remove the HTTP-only cookie for client header
     */
    this.router.post(`${this.path}/logout`, this.loggingOut);
  }

  private registration = async (request: Request, response: Response, next: NextFunction) => {
    const userData: CreateUserDto = request.body;
    try {
      const { cookie, user } = await this.authenticationService.register(userData);
      response.setHeader('Set-Cookie', [cookie]);
      response.send(user);
    } catch (error) {
      next(error);
    }
  };

  private loggingIn = async (request: Request, response: Response, next: NextFunction) => {
    const logInData: LogInDto = request.body;
    const user = await this.userRepository
      .createQueryBuilder('user')
      .select()
      .addSelect('user.password')
      .where('user.email = :query', { query: logInData.email })
      .getOne();

    if (user) {
      const isPasswordMatching = await bcrypt.compare(logInData.password, user.password);

      if (isPasswordMatching) {
        const tokenData = this.authenticationService.createToken(user);

        response.setHeader('Set-Cookie', [this.authenticationService.createCookie(tokenData)]);
        delete user.password;
        response.send(user);
      } else {
        next(new WrongCredentialsException());
      }
    } else {
      next(new WrongCredentialsException());
    }
  };

  private loggingOut = (request: Request, response: Response) => {
    response.setHeader('Set-Cookie', ['Authorization=;Max-age=0']);
    response.status(200).send();
  };
}

export default AuthenticationController;
