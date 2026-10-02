import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Un pequeño plugin para ejecutar las funciones serverless de Vercel (carpeta api/) dentro de Vite localmente.
function vercelApiMock() {
  return {
    name: 'vercel-api-mock',
    config(config, { mode }) {
      // Cargar variables de entorno y meterlas en process.env para que el backend pueda leerlas
      const env = loadEnv(mode, process.cwd(), '');
      Object.assign(process.env, env);
    },
    configureServer(server) {
      server.middlewares.use('/api', async (req, res, next) => {
        const urlPath = req.url.split('?')[0];
        const apiPath = path.resolve(__dirname, 'api', urlPath.substring(1) + '.js');
        
        if (fs.existsSync(apiPath)) {
          try {
            // Leer y parsear el body si es POST
            if (req.method === 'POST') {
               const buffers = [];
               for await (const chunk of req) {
                 buffers.push(chunk);
               }
               const bodyStr = Buffer.concat(buffers).toString();
               req.body = bodyStr ? JSON.parse(bodyStr) : {};
            }
            
            // Importar dinámicamente el handler
            // Añadimos un timestamp para evitar la caché del módulo en desarrollo
            const module = await import('file://' + apiPath + '?t=' + Date.now());
            const handler = module.default;
            
            // Mockear los helpers de respuesta de Vercel/Express
            res.status = (code) => {
              res.statusCode = code;
              return res;
            };
            res.json = (data) => {
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(data));
            };
            
            await handler(req, res);
          } catch (e) {
            console.error('Error en API Local:', e);
            res.statusCode = 500;
            res.end(JSON.stringify({ error: e.message }));
          }
        } else {
          next();
        }
      });
    }
  };
}

export default defineConfig({
  plugins: [react(), vercelApiMock()],
});
