import HttpException from './HttpException';

class NoOffersFoundException extends HttpException {
  constructor(hint?: string) {
    super(404, "No offers found", hint);
  }
}

export default NoOffersFoundException;