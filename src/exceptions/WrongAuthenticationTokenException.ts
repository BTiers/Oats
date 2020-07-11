import HttpException from './HttpException';

class WrongAuthenticationTokenException extends HttpException {
  constructor() {
    super(
      401,
      'Wrong authentication token',
      `Either the token hasn't been issued by our service or it is expired`,
    );
  }
}

export default WrongAuthenticationTokenException;
