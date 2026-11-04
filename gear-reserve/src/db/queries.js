import db from './index.js';

function table(name, connection) {
  return connection ? db(name).connection(connection) : db(name);
}

export const findUserByEmail = (email) => db('users').where({ email }).first();
export const findUser = (id) => db('users').where({ id }).first();
export const listEquipment = () => db('equipment').orderBy('id');
export const listReservations = (user_id) => db('reservations').where({ user_id }).orderBy('starts_at').orderBy('id');
export const findEquipment = (id, connection) => table('equipment', connection).where({ id }).first();
export const findOwnedReservation = (id, user_id, connection) => table('reservations', connection).where({ id, user_id }).first();
export const insertReservation = (reservation, connection) => table('reservations', connection).insert(reservation);
export const updateStatus = (id, status, connection) => table('reservations', connection).where({ id }).update({ status });
export const findIdempotencyResult = (user_id, idempotency_key, connection) => table('idempotency_results', connection).where({ user_id, idempotency_key }).first();
export const saveIdempotencyResult = (result, connection) => table('idempotency_results', connection).insert(result);

export function findOverlap(equipment_id, startsAt, endsAt, connection) {
  return table('reservations', connection)
    .where({ equipment_id })
    .whereIn('status', ['reserved', 'checked_out'])
    .where('starts_at', '<', endsAt)
    .where('ends_at', '>', startsAt)
    .first();
}

export function findCheckout(equipment_id, connection) {
  return table('reservations', connection).where({ equipment_id, status: 'checked_out' }).first();
}

export async function writeTransaction(action) {
  const connection = await db.client.acquireConnection();
  try {
    await db.raw('BEGIN IMMEDIATE').connection(connection);
    try {
      const result = await action(connection);
      await db.raw('COMMIT').connection(connection);
      return result;
    } catch (error) {
      await db.raw('ROLLBACK').connection(connection);
      throw error;
    }
  } finally {
    await db.client.releaseConnection(connection);
  }
}
