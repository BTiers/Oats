import HttpException from './HttpException';

class NoClientFoundException extends HttpException {
  constructor() {
    super(404, "No clients found");
  }
}

export default NoClientFoundException;