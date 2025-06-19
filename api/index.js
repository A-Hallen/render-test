const express = require('express');
const path = require('path');

// Importar el servidor express
const app = require('../backend/dist/server.js');

// Exportar el servidor
module.exports = app;
