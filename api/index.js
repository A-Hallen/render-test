const backend = require('../backend/dist/server.js');

// Exportar el servidor del backend
module.exports = backend;

// Para desarrollo local
if (require.main === module) {
    const port = process.env.PORT || 3000;
    backend.listen(port, () => {
        console.log(`Servidor escuchando en http://localhost:${port}`);
    });
}
