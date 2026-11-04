// Starts an API with a temporary seeded database, logs in, and sends 20 parallel
// bookings for the same item and time window using different idempotency keys.
// Checks for one success, 19 conflicts, and one saved reservation, then cleans up.
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
  const equipmentId = equipment.body.items[0].id;
  const body = {
    startsAt: new Date(Date.now() + 3600000).toISOString(),
    endsAt: new Date(Date.now() + 7200000).toISOString()
  };

  console.log('Sending 20 parallel bookings for the same item and time window...');
  const results = await Promise.all(Array.from({ length: 20 }, () =>
    demo.request(`/equipment/${equipmentId}/reservations`, {
      method: 'POST', token, body, key: randomUUID()
    })
  ));
  const successes = results.filter((result) => result.status === 201);
  const conflicts = results.filter((result) => result.status === 409 && result.body.error.code === 'RESERVATION_CONFLICT');
  assert.equal(successes.length, 1, JSON.stringify(results));
  assert.equal(conflicts.length, 19, JSON.stringify(results));
  const rows = await demo.db('reservations').where({ equipment_id: equipmentId, status: 'reserved' });
  assert.equal(rows.length, 1);
  assert.equal(rows[0].id, successes[0].body.id);
  console.log('PASS: one 201, nineteen booking conflicts, and exactly one database reservation.');
} finally {
  await demo.close();
}
