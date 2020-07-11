import * as express from 'express';

import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import * as helmet from 'helmet';
import * as cors from 'cors';

import Controller from './shared/interfaces/controller.interface';
import errorMiddleware from './middleware/error.middleware';

class App {
  private app: express.Application;

  constructor(controllers: Controller[]) {
    this.app = express();

    this.initializeMiddlewares();
    this.initializeControllers(controllers);
    this.initializeErrorHandling();
  }

  public listen() {
    this.app.listen(process.env.PORT, () => {
      console.log(`App listening on the port ${process.env.PORT}`);
    });
  }

  public getServer() {
    return this.app;
  }

  private initializeMiddlewares() {
    this.app.use(helmet());
    this.app.use(bodyParser.json());
    this.app.use(cookieParser());
    this.app.use(
      cors({
        origin: 'http://localhost:3000',
        credentials: true,
      }),
    );
  }

  private initializeErrorHandling() {
    this.app.use(errorMiddleware);
  }

  private initializeControllers(controllers: Controller[]) {
    controllers.forEach((controller) => {
      this.app.use('/', controller.router);
    });
  }
}

export default App;
