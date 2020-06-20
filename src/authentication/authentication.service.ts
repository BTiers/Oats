import * as jwt from 'jsonwebtoken';

import { getRepository } from 'typeorm';

import UserWithThatEmailAlreadyExistsException from '../exceptions/UserWithThatEmailAlreadyExistsException';

import { XSRFTokenData, Token, RefreshTokenData } from '../shared/interfaces/token.interface';

import CreateUserDto from '../user/user.dto';
import User from '../user/user.entity';

class AuthenticationService {
  private userRepository = getRepository(User);

  public async register(userData: CreateUserDto) {
    if (await this.userRepository.findOne({ email: userData.email })) {
      throw new UserWithThatEmailAlreadyExistsException(userData.email);
    }
    const user = this.userRepository.create({
      ...userData,
    });

    await this.userRepository.save(user);

    const xsrfToken = this.createXSRFToken();
    const refreshToken = this.createRefreshToken(user, xsrfToken);

    const cookie = this.createCookie(refreshToken);
    return {
      cookie,
      token: xsrfToken,
      user,
    };
  }

  public createCookie(tokenData: Token) {
    return `Authorization=${tokenData.token}; PATH=/; HttpOnly; Max-Age=${tokenData.expiresIn}`;
  }

  public createRefreshToken(user: User, xsrfToken: Token): Token {
    const expiresIn = 60 * 60 * 24 * 5; // 5 days
    const refreshTokenData: RefreshTokenData = {
      xsrfToken: xsrfToken.token,
      _exp: expiresIn,
      sub: user.id,
    };

    return {
      expiresIn,
      token: jwt.sign(refreshTokenData, process.env.JWT_SECRET, { expiresIn }),
    };
  }

  public updateRefreshToken(refreshToken: RefreshTokenData & { exp: number }, xsrfToken: Token): Token {
    const refreshTokenData: RefreshTokenData = {
      sub: refreshToken.sub,
      _exp: refreshToken._exp,
      xsrfToken: xsrfToken.token,
    };

    return {
      expiresIn: refreshToken._exp,
      token: jwt.sign(refreshTokenData, process.env.JWT_SECRET, { expiresIn: refreshToken.exp }),
    };
  }

  public createXSRFToken(): Token {
    const expiresIn = 60 * 60; // 60 minutes FIXME Too long but get tires of refreshing IT every 15 minutes x)
    const xsrfData: XSRFTokenData = {};

    return {
      expiresIn,
      token: jwt.sign(xsrfData, process.env.JWT_SECRET, { expiresIn }),
    };
  }
}

export default AuthenticationService;
