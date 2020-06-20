import HttpException from './HttpException';

class ExceededPageIndexException extends HttpException {
  constructor(message: string) {
    super(404, message);
  }
}

export default ExceededPageIndexException;
