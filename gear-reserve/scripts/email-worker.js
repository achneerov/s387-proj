import { setTimeout as sleep } from 'node:timers/promises';
import db from '../src/db/index.js';

const provider = process.env.EMAIL_PROVIDER_URL || 'http://localhost:3001/messages';

while (true) {
  const message = await db('email_outbox')
    .join('reservations', 'reservations.id', 'email_outbox.reservation_id')
    .join('users', 'users.id', 'reservations.user_id')
    .where('email_outbox.status', 'pending')
    .first('reservation_id', 'attempts', 'email');

  if (!message) {
    await sleep(500);
    continue;
  }

  let delivered;
  try {
    const response = await fetch(provider, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: message.reservation_id,
        to: message.email,
        subject: 'GearReserve booking confirmed'
      }),
      signal: AbortSignal.timeout(2000)
    });
    delivered = response.ok;
    await response.body?.cancel();
  } catch {
    delivered = false;
  }

  const attempts = message.attempts + 1;
  let status = 'pending';
  if (delivered) status = 'sent';
  else if (attempts >= 5) status = 'failed';

  await db('email_outbox').where({ reservation_id: message.reservation_id })
    .update({ status, attempts });
  console.log(`Booking email ${message.reservation_id}: ${status}`);
  if (status === 'pending') await sleep(500 * 2 ** (attempts - 1));
}
