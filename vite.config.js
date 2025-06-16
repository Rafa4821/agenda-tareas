import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// Middleware para simular la API de Vercel en desarrollo
const vercelApiDevMiddleware = {
  name: 'vercel-api-dev-middleware',
  configureServer(server) {
    server.middlewares.use(async (req, res, next) => {
      if (req.url.startsWith('/api/')) {
        try {
          // Body parser para POST/PUT
          if (req.method === 'POST' || req.method === 'PUT') {
            const chunks = [];
            for await (const chunk of req) {
              chunks.push(chunk);
            }
            req.body = JSON.parse(Buffer.concat(chunks).toString());
          }

          // Query parser
          const url = new URL(req.url, `http://${req.headers.host}`);
          req.query = Object.fromEntries(url.searchParams.entries());

          // Importa dinámicamente el handler para obtener la última versión
          const modulePath = `.${req.url.split('?')[0]}.js`;
          const { default: handler } = await import(modulePath + `?t=${Date.now()}`);

          // Adapta la respuesta de Node a la de Vercel
          res.status = (code) => {
            res.statusCode = code;
            return res;
          };
          res.json = (data) => {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(data));
          };
          res.send = (data) => res.end(data);

          return handler(req, res);
        } catch (error) {
          console.error(`Error in API middleware: ${error.message}`);
          res.statusCode = 500;
          res.end(`Server error: ${error.message}`);
        }
      } else {
        next();
      }
    });
  }
};

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    vercelApiDevMiddleware, // Nuestro middleware de API
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Agenda de Tareas Pro',
        short_name: 'AgendaPro',
        description: 'Gestor de tareas PWA inspirado en Airtable.',
        theme_color: '#ffffff',
        // No especificamos iconos para que el plugin use los suyos por defecto o no dé error si no existen
      },
    }),
  ],
});
