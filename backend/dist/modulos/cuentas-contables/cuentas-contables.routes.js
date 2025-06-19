"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const cuentas_contables_controller_1 = require("./cuentas-contables.controller");
const cuentasContablesRouter = (0, express_1.Router)();
const cuentasContablesController = new cuentas_contables_controller_1.CuentasContablesController();
// Asignar todas las rutas del controlador al router
cuentasContablesRouter.use('/cuentas-contables', cuentasContablesController.getRouter());
exports.default = cuentasContablesRouter;
