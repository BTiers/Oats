import HttpException from './HttpException';

class NoCandidatesFoundException extends HttpException {
  constructor(hint?: string) {
    super(404, 'No candidates found', hint);
  }
}

export default NoCandidatesFoundException;
