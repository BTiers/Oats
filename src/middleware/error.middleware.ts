import { NextFunction, Request, Response } from 'express';
import HttpException from '../exceptions/HttpException';

function errorMiddleware(error: HttpException, request: Request, response: Response, next: NextFunction) {
  const status = error.status || 500;
  const message = error.message || 'Something went wrong';
  const hint = error.hint || 'No hint available';

  response
    .status(status)
    .send({
      message,
      status,
      hint,
    });
}

export default errorMiddleware;
