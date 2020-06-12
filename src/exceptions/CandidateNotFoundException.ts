import HttpException from './HttpException';

class CandidateNotFoundException extends HttpException {
  constructor(id: string) {
    super(404, `Candidate with id ${id} not found`);
  }
}

export default CandidateNotFoundException;