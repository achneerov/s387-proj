const express = require('express');
const path = require('node:path');

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`GearReserve: http://localhost:${port}`));
