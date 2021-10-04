import HttpException from './HttpException';

class NoUsersFoundException extends HttpException {
  constructor(hint?: string) {
    super(404, 'No users found', hint);
  }
}

export default NoUsersFoundException;
