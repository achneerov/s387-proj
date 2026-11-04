import express from 'express';
import path from 'node:path';

const app = express();

app.use(express.json());
app.use(express.static(path.join(import.meta.dirname, '../public')));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`GearReserve: http://localhost:${port}`));
