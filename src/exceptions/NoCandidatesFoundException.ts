import HttpException from './HttpException';

class NoCandidatesFoundException extends HttpException {
  constructor() {
    super(404, 'No candidates found');
  }
}

export default NoCandidatesFoundException;
