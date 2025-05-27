import { UserRole } from 'shared/src/types/auth.types';

export {}

declare global {
  namespace Express {
    export interface Request extends express.Request {
      user?: {
        uid: string;
        email?: string;
        role: UserRole;
        permissions?: string[];
      };
    }
    export interface Router {
        get(path: string, handler: (req: express.Request, res: express.Response, next?: express.NextFunction) => any): Router;
        post(path: string, handler: (req: express.Request, res: express.Response, next?: express.NextFunction) => any): Router;
        put(path: string, handler: (req: express.Request, res: express.Response, next?: express.NextFunction) => any): Router;
        delete(path: string, handler: (req: express.Request, res: express.Response, next?: express.NextFunction) => any): Router;
    }
  }
}

