import { plainToClass } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';
import * as express from 'express';
import HttpException from '../exceptions/HttpException';

function getErrorMessage(error: ValidationError): String[] {
  return error.children.flatMap((childError: ValidationError) => {
    if (childError?.children?.length) return getErrorMessage(childError);
    return Object.values(childError.constraints);
  });
}

function queryValidationMiddleware<T>(type: any, skipMissingProperties = false): express.RequestHandler {
  return (req, res, next) => {
    validate(plainToClass(type, req.query), {
      skipMissingProperties,
      whitelist: true,
      forbidNonWhitelisted: true,
    }).then((errors: ValidationError[]) => {
      if (errors.length > 0) {
        const message = errors
          .map((error: ValidationError) =>
            error.children && error.children.length > 0
              ? getErrorMessage(error)
              : Object.values(error.constraints),
          )
          .join(', ');
        next(new HttpException(400, message));
      } else {
        next();
      }
    });
  };
}

export default queryValidationMiddleware;
