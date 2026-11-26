import { createHash, randomUUID } from 'node:crypto';
import * as store from '../db/queries.js';
import { fail } from '../error.js';

function representation(row) {
  return {
    id: row.id,
    userId: row.user_id,
    equipmentId: row.equipment_id,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    status: row.status
  };
}

export const listEquipment = () => store.listEquipment();
export const listMine = async (userId) => (await store.listReservations(userId)).map(representation);

async function mutate(userId, key, method, target, input, action) {
  const hash = createHash('sha256').update(JSON.stringify([method, target, input])).digest('hex');
  return store.writeTransaction(async (connection) => {
    const saved = await store.findIdempotencyResult(userId, key, connection);
    if (saved) {
      if (saved.request_hash !== hash) {
        fail(409, 'IDEMPOTENCY_CONFLICT', 'This key was already used for a different request.');
      }
      return { status: saved.response_status, body: JSON.parse(saved.response_body) };
    }
    const result = await action(connection);
    await store.saveIdempotencyResult({
      user_id: userId, idempotency_key: key, request_hash: hash,
      response_status: result.status, response_body: JSON.stringify(result.body)
    }, connection);
    return result;
  });
}

export function createReservation(userId, equipmentId, key, input) {
  input = {
    startsAt: new Date(input.startsAt).toISOString(),
    endsAt: new Date(input.endsAt).toISOString()
  };
  return mutate(userId, key, 'POST', `/equipment/${equipmentId}/reservations`, input, async (connection) => {
    if (input.startsAt <= new Date().toISOString() || input.endsAt <= input.startsAt) {
      fail(422, 'INVALID_INTERVAL', 'Start must be in the future and end must be after start.');
    }
    if (!await store.findEquipment(equipmentId, connection)) {
      fail(404, 'NOT_FOUND', 'Equipment not found.');
    }
    if (await store.findOverlap(equipmentId, input.startsAt, input.endsAt, connection)) {
      fail(409, 'RESERVATION_CONFLICT', 'Equipment is unavailable for this window.');
    }
    const row = {
      id: randomUUID(), user_id: userId, equipment_id: equipmentId,
      starts_at: input.startsAt, ends_at: input.endsAt, status: 'reserved'
    };
    await store.insertReservation(row, connection);
    await store.enqueueBookingEmail(row.id, connection);
    return { status: 201, body: representation(row) };
  });
}

export function changeStatus(userId, reservationId, key, input) {
  return mutate(userId, key, 'PATCH', `/reservations/${reservationId}`, input, async (connection) => {
    const row = await store.findOwnedReservation(reservationId, userId, connection);
    if (!row) fail(404, 'NOT_FOUND', 'Reservation not found.');

    const allowed = { reserved: ['checked_out', 'cancelled'], checked_out: ['returned'] };
    if (!allowed[row.status]?.includes(input.status)) {
      fail(409, 'INVALID_TRANSITION', 'This status change is not allowed.');
    }
    if (input.status === 'checked_out') {
      const now = new Date().toISOString();
      if (now < row.starts_at || now >= row.ends_at) {
        fail(409, 'OUTSIDE_BOOKING_WINDOW', 'Checkout is only allowed during the booking window.');
      }
      if (await store.findCheckout(row.equipment_id, connection)) {
        fail(409, 'ITEM_CHECKED_OUT', 'This equipment has not been returned yet.');
      }
    }
    await store.updateStatus(row.id, input.status, connection);
    return { status: 200, body: representation({ ...row, status: input.status }) };
  });
}
