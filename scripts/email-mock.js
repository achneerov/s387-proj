import express from 'express';

const app = express();
const messages = new Map();
const simulateFailure = process.env.EMAIL_MOCK_FAIL === '1';

app.use(express.json());

app.post('/messages', (req, res) => {
  const id = req.body?.id;
  if (typeof id !== 'string' || !id.trim()) {
    return res.status(400).json({ error: 'Message ID is required.' });
  }
  if (messages.has(id)) return res.sendStatus(204);
  if (simulateFailure) return res.sendStatus(503);

  messages.set(id, req.body);
  return res.sendStatus(204);
});

app.get('/messages', (req, res) => {
  res.json([...messages.values()]);
});

app.use((error, req, res, next) => {
  res.status(error.status ?? 500).json({ error: 'Could not process the request.' });
});

const port = process.env.EMAIL_MOCK_PORT || 3001;
app.listen(port, () => console.log(`Email mock listening on port ${port}`));
