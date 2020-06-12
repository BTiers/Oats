import HttpException from './HttpException';

class ClientNotFoundException extends HttpException {
  constructor(id: string) {
    super(404, `Client with id ${id} not found`);
  }
}

export default ClientNotFoundException;