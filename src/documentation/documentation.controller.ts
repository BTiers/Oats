import { Router, Request, Response, NextFunction } from 'express';

import * as swaggerJSDoc  from 'swagger-jsdoc';

import Controller from '../shared/interfaces/controller.interface';

class DocumentationController implements Controller {
  public path = '/documentation';
  public router = Router();

  private swaggerSpec = swaggerJSDoc({
    swaggerDefinition: {
      info: {
        title: 'Open Applicant Tracking System',
        version: '0.0.1',
        description: 'OATS API definition',
      },
      host: process.env.DOMAIN,
      basePath: '/documentation',
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          }
        }
      },
      security: [{
        bearerAuth: []
      }]
    },
    explorer: true,
    apis: ['**/*.ts'],
  });

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}`, this.getSwaggerDocument);
    this.router.get(`${this.path}/latest`, this.getLatestDocumentation);
  }

  private getSwaggerDocument = async (_: Request, response: Response, __: NextFunction) => {
    response.setHeader('Content-Type', 'application/json');
    response.send(this.swaggerSpec);
  };

  private getLatestDocumentation = async (
    _: Request,
    response: Response,
    __: NextFunction,
  ) => {
    response.sendFile(`${__dirname}/documentation.redoc.html`);
  };
}

export default DocumentationController;
