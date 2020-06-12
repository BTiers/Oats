import HttpException from './HttpException';

import Client from '../client/client.entity';

class ClientAlreadyExistsException extends HttpException {
  constructor(name: string, client: Client) {
    super(400, `Client named ${name} already exists`, client);
  }
}

export default ClientAlreadyExistsException;
