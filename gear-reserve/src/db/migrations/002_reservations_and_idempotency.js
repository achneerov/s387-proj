export async function up(db) {
  await db.schema.createTable('reservations', (table) => {
    table.text('id').primary().notNullable();
    table.text('user_id').notNullable().references('id').inTable('users');
    table.text('equipment_id').notNullable().references('id').inTable('equipment');
    table.text('starts_at').notNullable();
    table.text('ends_at').notNullable();
    table.enu('status', ['reserved', 'checked_out', 'returned', 'cancelled'])
      .notNullable().defaultTo('reserved');
    table.check('ends_at > starts_at');
    table.index('user_id');
    table.index(['equipment_id', 'status', 'starts_at', 'ends_at']);
  });

  await db.raw("CREATE UNIQUE INDEX one_checkout_per_item ON reservations (equipment_id) WHERE status = 'checked_out'");

  await db.schema.createTable('idempotency_results', (table) => {
    table.text('user_id').notNullable().references('id').inTable('users');
    table.text('idempotency_key').notNullable();
    table.text('request_hash').notNullable();
    table.integer('response_status').notNullable();
    table.text('response_body').notNullable();
    table.primary(['user_id', 'idempotency_key']);
  });
}

export async function down(db) {
  await db.schema.dropTable('idempotency_results');
  await db.schema.dropTable('reservations');
}
