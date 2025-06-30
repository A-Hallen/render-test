import { Router } from 'express';
import { CuentasContablesController } from './cuentas-contables.controller';
import { AuthMiddleware } from '../auth/auth.middleware';

const cuentasContablesRouter = Router();
const cuentasContablesController = new CuentasContablesController();
const authMiddleware = new AuthMiddleware();

cuentasContablesRouter.get('/', 
    authMiddleware.verifyToken.bind(authMiddleware), cuentasContablesController.obtenerCuentas.bind(cuentasContablesController));

    cuentasContablesRouter.get('/codigos', 
    authMiddleware.verifyToken.bind(authMiddleware), cuentasContablesController.obtenerCuentasPorCodigos.bind(cuentasContablesController));
export default cuentasContablesRouter;
