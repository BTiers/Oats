import 'dotenv/config';
import 'reflect-metadata';
import { createConnection } from 'typeorm';

import App from './app';
import * as ORMConfig from './ormconfig';
import validateEnv from './utils/validateEnv';

import DocumentationController from './documentation/documentation.controller';

import AuthenticationController from './authentication/authentication.controller';
import UserController from './user/user.controller';
import ClientController from './client/client.controller';
import OfferController from './offer/offer.controller';
import CandidateController from './candidate/candidate.controller';
import AnalyticsController from './analytics/analytics.controller';
import FTSController from './fts/full-text-search.controller';

validateEnv();

(async () => {
  try {
    const connection = await createConnection(ORMConfig);
    await connection.runMigrations();
  } catch (error) {
    console.log('Error while connecting to the database', error);
    return error;
  }
  const app = new App([
    new DocumentationController(),

    new AuthenticationController(),
    new UserController(),
    new ClientController(),
    new OfferController(),
    new CandidateController(),
    new AnalyticsController(),
    new FTSController(),
  ]);
  app.listen();
})();
