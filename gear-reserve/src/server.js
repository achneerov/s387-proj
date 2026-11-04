import express from 'express';
import path from 'node:path';
import * as OpenApiValidator from 'express-openapi-validator';
import api from './routes/api.js';
import { authenticate } from './services/auth.js';

const app = express();

app.use(express.json());
app.use(express.static(path.join(import.meta.dirname, '../public')));
app.use(OpenApiValidator.middleware({
  apiSpec: path.join(import.meta.dirname, '../openapi.yaml'),
  validateSecurity: {
    handlers: {
      bearerAuth: async (req) => {
        req.user = await authenticate(req);
        return true;
      }
    }
  }
}));
app.use('/api/v1', api);

app.use((req, res) => {
  res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Endpoint not found.' } });
});

app.use((error, req, res, next) => {
  if (error.status && error.code) {
    return res.status(error.status).json({
      error: { code: error.code, message: error.message }
    });
  }
  res.status(500).json({
    error: { code: 'INTERNAL_ERROR', message: 'Unexpected server error.' }
  });
});

const port = process.env.PORT || 3000;
const server = app.listen(port, (error) => {
  if (error) throw error;
  console.log(`GearReserve: http://localhost:${server.address().port}`);
});
