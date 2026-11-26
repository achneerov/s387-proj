export async function up(db) {
  await db.schema.createTable('users', (table) => {
    table.text('id').primary().notNullable();
    table.text('email').unique().notNullable();
    table.text('password_hash').notNullable();
    table.enu('role', ['borrower', 'admin']).notNullable();
  });

  await db.schema.createTable('equipment', (table) => {
    table.text('id').primary().notNullable();
    table.text('name').notNullable();
    table.text('description').notNullable().defaultTo('');
  });
}

export async function down(db) {
  await db.schema.dropTable('equipment');
  await db.schema.dropTable('users');
}
