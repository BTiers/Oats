import HttpException from './HttpException';

class NoUsersFoundException extends HttpException {
  constructor() {
    super(404, 'No users found');
  }
}

export default NoUsersFoundException;
