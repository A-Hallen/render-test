import { Router } from 'express';
import { CuentasContablesController } from './cuentas-contables.controller';

const cuentasContablesRouter = Router();
const cuentasContablesController = new CuentasContablesController();

// Asignar todas las rutas del controlador al router
cuentasContablesRouter.use('/cuentas-contables', cuentasContablesController.getRouter());

export default cuentasContablesRouter;
