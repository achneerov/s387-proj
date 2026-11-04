import jwt from 'jsonwebtoken';
import { expressjwt } from 'express-jwt';
import { compare } from 'bcryptjs';
import { findUser, findUserByEmail } from '../db/queries.js';
import { fail } from '../error.js';

const secret = process.env.JWT_SECRET;
if (!secret || secret.length < 32) {
  throw new Error('Set JWT_SECRET to a random secret of at least 32 characters.');
}
const tokenOptions = { issuer: 'gearreserve', audience: 'gearreserve-api' };
const checkJwt = expressjwt({
  secret,
  algorithms: ['HS256'],
  ...tokenOptions
});

export async function login(email, password) {
  const user = await findUserByEmail(email);
  if (!user || !await compare(password, user.password_hash)) {
    fail(401, 'INVALID_CREDENTIALS', 'Invalid email or password.');
  }
  return {
    accessToken: jwt.sign({}, secret, {
      ...tokenOptions, subject: user.id, algorithm: 'HS256', expiresIn: '1h'
    })
  };
}

export async function authenticate(req) {
  await new Promise((resolve, reject) => {
    checkJwt(req, req.res, (error) => error ? reject(error) : resolve());
  });
  if (typeof req.auth?.sub !== 'string' || typeof req.auth?.exp !== 'number') {
    fail(401, 'INVALID_TOKEN', 'Token must contain a user ID and expiration.');
  }
  const user = await findUser(req.auth.sub);
  if (!user) fail(401, 'INVALID_TOKEN', 'Account not found.');
  return { id: user.id, role: user.role };
}
