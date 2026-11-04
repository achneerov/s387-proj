// Creates a booking in a temporary seeded database, then stops and restarts the
// API using the same database file. Checks that the booking and its saved
// idempotency response still exist without creating a duplicate, then cleans up.
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { createDemo } from './demo-helper.js';

const demo = await createDemo();
try {
  await demo.start();
  const login = await demo.request('/auth/login', {
    method: 'POST', body: { email: 'alice@gearreserve.test', password: 'demo-password' }
  });
  assert.equal(login.status, 200, JSON.stringify(login.body));
  const token = login.body.accessToken;
  const equipment = await demo.request('/equipment', { token });
  assert.equal(equipment.status, 200, JSON.stringify(equipment.body));
  const endpoint = `/equipment/${equipment.body.items[0].id}/reservations`;
  const options = {
    method: 'POST', token, key: randomUUID(),
    body: {
      startsAt: new Date(Date.now() + 3600000).toISOString(),
      endsAt: new Date(Date.now() + 7200000).toISOString()
    }
  };
  const created = await demo.request(endpoint, options);
  assert.equal(created.status, 201, JSON.stringify(created.body));
  console.log(`Created reservation ${created.body.id}. Restarting the API without resetting the database...`);

  await demo.stop();
  await demo.start();

  const reservations = await demo.request('/me/reservations', { token });
  assert.equal(reservations.status, 200, JSON.stringify(reservations.body));
  assert.deepEqual(reservations.body.items, [created.body]);
  const replay = await demo.request(endpoint, options);
  assert.deepEqual(replay, created);
  assert.equal((await demo.db('reservations')).length, 1);
  console.log('PASS: the reservation and saved idempotency response survived an API restart.');
} finally {
  await demo.close();
}
