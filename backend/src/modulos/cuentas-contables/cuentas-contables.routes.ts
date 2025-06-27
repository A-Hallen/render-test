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

    cuentasContablesRouter.post('/', 
    authMiddleware.verifyToken.bind(authMiddleware), cuentasContablesController.crearCuenta.bind(cuentasContablesController));
cuentasContablesRouter.put('/:codigo', 
    authMiddleware.verifyToken.bind(authMiddleware), cuentasContablesController.actualizarCuenta.bind(cuentasContablesController));

cuentasContablesRouter.delete('/:codigo', 
    authMiddleware.verifyToken.bind(authMiddleware), cuentasContablesController.eliminarCuenta.bind(cuentasContablesController));

    cuentasContablesRouter.get('/nombres', 
    authMiddleware.verifyToken.bind(authMiddleware), cuentasContablesController.obtenerCuentasPorNombres.bind(cuentasContablesController));
export default cuentasContablesRouter;
