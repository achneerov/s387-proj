import path from 'node:path';

export default {
  client: 'better-sqlite3',
  connection: { filename: path.join(import.meta.dirname, 'data/gearreserve.sqlite') },
  useNullAsDefault: true,
  pool: {
    min: 1,
    max: 1,
    afterCreate(connection, done) {
      try {
        connection.pragma('foreign_keys = ON');
        connection.pragma('journal_mode = WAL');
        connection.pragma('busy_timeout = 5000');
        done(null, connection);
      } catch (error) {
        done(error);
      }
    }
  },
  migrations: { directory: path.join(import.meta.dirname, 'src/db/migrations') },
  seeds: { directory: path.join(import.meta.dirname, 'src/db/seeds') }
};
