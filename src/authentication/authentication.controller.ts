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
    this.router.post(`${this.path}/register`, validationMiddleware(CreateUserDto), this.registration);
    this.router.post(`${this.path}/login`, validationMiddleware(LogInDto), this.loggingIn);
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
    const user = await this.userRepository.findOne({ email: logInData.email });

    if (user) {
      const isPasswordMatching = await bcrypt.compare(logInData.password, user.password);

      if (isPasswordMatching) {
        const tokenData = this.authenticationService.createToken(user);

        response.setHeader('Set-Cookie', [this.authenticationService.createCookie(tokenData)]);
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
