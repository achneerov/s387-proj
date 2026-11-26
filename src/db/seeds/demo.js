import { hashSync } from 'bcryptjs';

export async function seed(db) {
  await db.transaction(async (trx) => {
    await trx('users').insert([
      { id: '00000000-0000-4000-8000-000000000001', email: 'admin@gearreserve.test', role: 'admin' },
      { id: '00000000-0000-4000-8000-000000000002', email: 'alice@gearreserve.test', role: 'borrower' },
      { id: '00000000-0000-4000-8000-000000000003', email: 'bob@gearreserve.test', role: 'borrower' }
    ].map((user) => ({ ...user, password_hash: hashSync('demo-password', 10) })));

    await trx('equipment').insert([
      { id: '00000000-0000-4000-8000-000000000101', name: 'Camera', description: 'Digital camera' },
      { id: '00000000-0000-4000-8000-000000000102', name: 'Microphone', description: 'USB microphone' },
      { id: '00000000-0000-4000-8000-000000000103', name: 'Projector', description: 'Portable projector' }
    ]);
  });
}
