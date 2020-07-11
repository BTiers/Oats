import { Request, Response, NextFunction, Router } from 'express';

import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

import { getRepository } from 'typeorm';

import Controller from '../shared/interfaces/controller.interface';
import { RefreshTokenData } from '../shared/interfaces/token.interface';

import validationMiddleware from '../middleware/validation.middleware';

import AuthenticationService from './authentication.service';

import LogInDto from './logIn.dto';
import CreateUserDto from '../user/user.dto';

import User from '../user/user.entity';

import WrongCredentialsException from '../exceptions/WrongCredentialsException';
import AuthenticationTokenMissingException from '../exceptions/AuthenticationTokenMissingException';
import WrongAuthenticationTokenException from '../exceptions/WrongAuthenticationTokenException';


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
     * definitions:
     *  Token:
     *    description: A XSRF-Token
     *    properties:
     *      expiresIn:
     *        type: number
     *        description: The token lifetime
     *      token:
     *        type: string
     *        description: The token to include in subsequent request as headers['x-xsrf-token']
     */

    /**
     * @swagger
     *
     * /authentication/users:
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
     *          properties:
     *            user:
     *              $ref: '#/definitions/User'
     *            xsrfToken:
     *              $ref: '#/definitions/Token'
     *      401:
     *        description: Wrong Credentials Provided
     *      500:
     *        description: Internal Server Error
     */
    this.router.post(`${this.path}/users`, validationMiddleware(CreateUserDto), this.registration);

    /**
     * @swagger
     *
     * /authentication/sessions:
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
     *          properties:
     *            user:
     *              $ref: '#/definitions/User'
     *            xsrfToken:
     *              $ref: '#/definitions/Token'
     *      401:
     *        description: Wrong Credentials Provided
     *      500:
     *        description: Internal Server Error
     */
    this.router.post(`${this.path}/sessions`, validationMiddleware(LogInDto), this.login);

    /**
     * @swagger
     *
     * /authentication/sessions:
     *  delete:
     *    summary: Logout
     *    description: Logout the current user
     *    tags:
     *      - Authentication
     *    responses:
     *      200:
     *        description: Remove the HTTP-only cookie from client header
     */
    this.router.delete(`${this.path}/sessions`, this.logout);

    /**
     * @swagger
     *
     * /authentication/sessions/token:
     *  get:
     *    summary: Refresh token
     *    description: Refresh the current XSRF-Token
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
     *      - Authentication
     *    responses:
     *      200:
     *        description: The new XSRF Token
     *        schema:
     *          $ref: '#/definitions/Token'
     *
     */
    this.router.get(`${this.path}/sessions/token`, this.refreshUserToken);
  }

  private registration = async (request: Request, response: Response, next: NextFunction) => {
    const userData: CreateUserDto = request.body;
    try {
      const { cookie, token, user } = await this.authenticationService.register(userData);
      response.setHeader('Set-Cookie', [cookie]);
      response.send({ user, token });
    } catch (error) {
      next(error);
    }
  };

  private login = async (request: Request, response: Response, next: NextFunction) => {
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
        const xsrfToken = this.authenticationService.createXSRFToken();
        const refreshToken = this.authenticationService.createRefreshToken(user, xsrfToken);

        response.setHeader('Set-Cookie', [this.authenticationService.createCookie(refreshToken)]);

        delete user.password;
        response.send({ user, xsrfToken });
      } else {
        next(new WrongCredentialsException());
      }
    } else {
      next(new WrongCredentialsException());
    }
  };

  private logout = (request: Request, response: Response) => {
    response.setHeader('Set-Cookie', ['Authorization=;Max-age=0']);
    response.status(200).send();
  };

  private refreshUserToken = async (request: Request, response: Response, next: NextFunction) => {
    const { cookies, headers } = request;

    if (cookies && cookies.Authorization && headers['x-xsrf-token']) {
      const retrievedXSRFToken = headers['x-xsrf-token'];
      const retrievedRefreshToken = jwt.verify(
        cookies.Authorization,
        process.env.JWT_SECRET,
      ) as RefreshTokenData & { exp: number };

      if (retrievedRefreshToken.xsrfToken === retrievedXSRFToken) {
        const xsrfToken = this.authenticationService.createXSRFToken();
        const refreshToken = this.authenticationService.updateRefreshToken(
          retrievedRefreshToken,
          xsrfToken,
        );

        response.setHeader('Set-Cookie', [this.authenticationService.createCookie(refreshToken)]);
        response.send({ xsrfToken });
      } else {
        next(new WrongAuthenticationTokenException());
      }
    } else {
      next(new AuthenticationTokenMissingException());
    }
  };
}

export default AuthenticationController;
