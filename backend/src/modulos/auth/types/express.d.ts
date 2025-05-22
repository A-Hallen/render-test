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
  }
}

