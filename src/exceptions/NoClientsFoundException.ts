import HttpException from './HttpException';

class NoClientFoundException extends HttpException {
  constructor(hint?: string) {
    super(404, "No clients found", hint);
  }
}

export default NoClientFoundException;