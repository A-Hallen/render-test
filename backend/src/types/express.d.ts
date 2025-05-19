import * as express from 'express';

declare global {
  namespace Express {
    // Puedes extender las interfaces Request y Response si es necesario
  }
}

// Esto permite que TypeScript reconozca correctamente los manejadores de rutas
declare module 'express' {
  interface Router {
    get(path: string, handler: (req: express.Request, res: express.Response, next?: express.NextFunction) => any): Router;
    post(path: string, handler: (req: express.Request, res: express.Response, next?: express.NextFunction) => any): Router;
    put(path: string, handler: (req: express.Request, res: express.Response, next?: express.NextFunction) => any): Router;
    delete(path: string, handler: (req: express.Request, res: express.Response, next?: express.NextFunction) => any): Router;
  }
}

export {};
