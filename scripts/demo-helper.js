import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { randomBytes } from 'node:crypto';
import path from 'node:path';
import knex from 'knex';
import config from '../knexfile.js';

export async function createDemo() {
  const directory = await mkdtemp(path.join(tmpdir(), 'gearreserve-demo-'));
  const filename = path.join(directory, 'demo.sqlite');
  const db = knex({ ...config, connection: { filename } });
  const env = { ...process.env, DATABASE_PATH: filename, JWT_SECRET: randomBytes(32).toString('hex'), PORT: '0' };
  let child;
  let url;

  async function stop() {
    if (child && child.exitCode === null && child.signalCode === null) {
      const exited = once(child, 'exit');
      child.kill();
      await exited;
    }
    child = null;
  }

  async function close() {
    await stop();
    await db.destroy();
    await rm(directory, { recursive: true, force: true });
  }

  try {
    await db.migrate.latest();
    await db.seed.run();
  } catch (error) {
    await close();
    throw error;
  }

  return {
    db, stop, close,
    async start() {
      child = spawn(process.execPath, ['src/server.js'], {
        cwd: path.join(import.meta.dirname, '..'), env, stdio: ['ignore', 'pipe', 'pipe']
      });
      await new Promise((resolve, reject) => {
        let logs = '';
        const timeout = setTimeout(() => reject(new Error(`API failed to start: ${logs}`)), 15000);
        child.once('error', (error) => { clearTimeout(timeout); reject(error); });
        child.once('exit', () => { clearTimeout(timeout); reject(new Error(`API exited: ${logs}`)); });
        child.stderr.on('data', (data) => { logs += data; });
        child.stdout.on('data', (data) => {
          logs += data;
          const match = logs.match(/GearReserve: (http:\/\/localhost:\d+)/);
          if (match) { url = match[1]; clearTimeout(timeout); resolve(); }
        });
      });
    },
    async request(endpoint, { method = 'GET', body, token, key } = {}) {
      const headers = {};
      if (token) headers.Authorization = `Bearer ${token}`;
      if (body) headers['Content-Type'] = 'application/json';
      if (key) headers['Idempotency-Key'] = key;
      const response = await fetch(`${url}/api/v1${endpoint}`, {
        method, headers, body: body ? JSON.stringify(body) : undefined,
        signal: AbortSignal.timeout(10000)
      });
      return { status: response.status, body: await response.json() };
    }
  };
}
