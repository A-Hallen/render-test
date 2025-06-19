"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEmailTemplate = getEmailTemplate;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
/**
 * Lee una plantilla HTML y reemplaza las variables con los valores proporcionados
 * @param templateName Nombre del archivo de plantilla (sin la extensión .html)
 * @param variables Objeto con las variables a reemplazar
 * @returns Contenido HTML con las variables reemplazadas
 */
function getEmailTemplate(templateName, variables) {
    try {
        // Ruta a la plantilla
        const templatePath = path_1.default.join(__dirname, '../templates/email', `${templateName}.html`);
        // Leer el contenido de la plantilla
        let templateContent = fs_1.default.readFileSync(templatePath, 'utf-8');
        // Reemplazar cada variable en la plantilla
        Object.entries(variables).forEach(([key, value]) => {
            const regex = new RegExp(`{{${key}}}`, 'g');
            templateContent = templateContent.replace(regex, value);
        });
        return templateContent;
    }
    catch (error) {
        console.error(`Error al cargar la plantilla de correo ${templateName}:`, error);
        // Devolver una plantilla simple en caso de error
        return `
      <div>
        <h1>Verificación de Email</h1>
        <p>Por favor, haz clic en el siguiente enlace para verificar tu email:</p>
        <p><a href="${variables.verificationLink || '#'}">${variables.verificationLink || 'Verificar email'}</a></p>
      </div>
    `;
    }
}
