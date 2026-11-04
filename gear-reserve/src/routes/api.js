import { Router } from 'express';
import { login } from '../services/auth.js';
import { listEquipment, listMine, createReservation, changeStatus } from '../services/reservations.js';

const router = Router();
router.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
  res.json(await login(email.trim().toLowerCase(), password));
});

router.get('/equipment', async (req, res) => {
  res.json({ items: await listEquipment() });
});

router.get('/me/reservations', async (req, res) => {
  res.json({ items: await listMine(req.user.id) });
});

router.post('/equipment/:equipmentId/reservations', async (req, res) => {
  const equipmentId = req.params.equipmentId.toLowerCase();
  const key = req.get('Idempotency-Key').toLowerCase();
  const result = await createReservation(req.user.id, equipmentId, key, req.body);
  res.status(result.status).json(result.body);
});

router.patch('/reservations/:reservationId', async (req, res) => {
  const reservationId = req.params.reservationId.toLowerCase();
  const key = req.get('Idempotency-Key').toLowerCase();
  const result = await changeStatus(req.user.id, reservationId, key, req.body);
  res.status(result.status).json(result.body);
});

export default router;
