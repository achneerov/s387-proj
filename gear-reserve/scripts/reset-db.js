import { rmSync } from 'node:fs';
import knex from 'knex';
import config from '../knexfile.js';

for (const suffix of ['', '-wal', '-shm']) {
  rmSync(config.connection.filename + suffix, { force: true });
}

const db = knex(config);
await db.migrate.latest();
await db.seed.run();
await db.destroy();
console.log('Database reset successfully.');
