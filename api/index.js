const express = require('express');
const path = require('path');

// Crear una nueva aplicación Express
const app = express();

// Middleware para manejar JSON
app.use(express.json());

// Importar las rutas del backend
const backend = require('../backend/dist/server.js');

// Usar las rutas del backend
app.use('/api', backend);

// Exportar la aplicación
module.exports = app;

// Para desarrollo local
if (require.main === module) {
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
        console.log(`Servidor escuchando en http://localhost:${port}`);
    });
}
