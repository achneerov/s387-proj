export async function up(db) {
  await db.schema.createTable('email_outbox', (table) => {
    table.text('reservation_id').primary().notNullable().references('id').inTable('reservations');
    table.text('status').notNullable().defaultTo('pending');
    table.integer('attempts').notNullable().defaultTo(0);
  });
}

export async function down(db) {
  await db.schema.dropTable('email_outbox');
}
