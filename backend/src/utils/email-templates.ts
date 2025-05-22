import fs from 'fs';
import path from 'path';

/**
 * Lee una plantilla HTML y reemplaza las variables con los valores proporcionados
 * @param templateName Nombre del archivo de plantilla (sin la extensión .html)
 * @param variables Objeto con las variables a reemplazar
 * @returns Contenido HTML con las variables reemplazadas
 */
export function getEmailTemplate(templateName: string, variables: Record<string, string>): string {
  try {
    // Ruta a la plantilla
    const templatePath = path.join(__dirname, '../templates/email', `${templateName}.html`);
    
    // Leer el contenido de la plantilla
    let templateContent = fs.readFileSync(templatePath, 'utf-8');
    
    // Reemplazar cada variable en la plantilla
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      templateContent = templateContent.replace(regex, value);
    });
    
    return templateContent;
  } catch (error) {
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
