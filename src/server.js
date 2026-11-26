import express from 'express';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import * as OpenApiValidator from 'express-openapi-validator';
import api from './routes/api.js';
import { authenticate } from './services/auth.js';
import { checkDatabase } from './db/queries.js';

const app = express();

app.use((req, res, next) => {
  const requestId = randomUUID();
  res.set('X-Request-Id', requestId);
  console.log(JSON.stringify({ requestId, method: req.method, path: req.path }));
  next();
});

app.get('/health/live', (req, res) => res.json({ status: 'ok' }));
app.get('/health/ready', async (req, res) => {
  try {
    await checkDatabase();
    res.json({ status: 'ok' });
  } catch {
    res.status(503).json({ status: 'unavailable' });
  }
});

app.use(express.json());
app.use(express.static(path.join(import.meta.dirname, '../public')));
app.use(OpenApiValidator.middleware({
  apiSpec: path.join(import.meta.dirname, '../openapi.yaml'),
  validateResponses: true,
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
  if (error.status >= 400 && error.status < 500) {
    return res.status(error.status).json({
      error: { code: error.code || 'INVALID_REQUEST', message: error.message }
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
