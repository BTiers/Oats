import HttpException from './HttpException';

class NoOffersFoundException extends HttpException {
  constructor() {
    super(404, "No offers found");
  }
}

export default NoOffersFoundException;