import { NextFunction, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { getRepository } from 'typeorm';

import AuthenticationTokenMissingException from '../exceptions/AuthenticationTokenMissingException';
import WrongAuthenticationTokenException from '../exceptions/WrongAuthenticationTokenException';

import { RefreshTokenData } from '../interfaces/token.interface';
import RequestWithUser from '../interfaces/requestWithUser.interface';

import User from '../user/user.entity';

async function authMiddleware(request: RequestWithUser, response: Response, next: NextFunction) {
  const { cookies, headers } = request;
  const userRepository = getRepository(User);

  if (cookies && cookies.Authorization && headers['x-xsrf-token']) {
    try {
      // Checking if the token is authentic
      jwt.verify(headers['x-xsrf-token'].toString(), process.env.JWT_SECRET) as { exp: number };
      const retrievedRefreshToken = jwt.verify(
        cookies.Authorization,
        process.env.JWT_SECRET,
      ) as RefreshTokenData & { exp: number };

      if (retrievedRefreshToken.xsrfToken === headers['x-xsrf-token']) {
        const id = retrievedRefreshToken.sub;
        const user = await userRepository.findOne(id);

        if (user) {
          request.user = user;
          next();
        } else {
          next(new WrongAuthenticationTokenException());
        }
      } else {
        next(new WrongAuthenticationTokenException());
      }
    } catch (error) {
      console.log(error);
      next(new WrongAuthenticationTokenException());
    }
  } else {
    next(new AuthenticationTokenMissingException());
  }
}

export default authMiddleware;
