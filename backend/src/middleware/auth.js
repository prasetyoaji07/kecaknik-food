// BR-12: rute admin wajib JWT valid dan berkedaluwarsa. Sandi dibandingkan dengan
// crypto.timingSafeEqual.
import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import { env } from '../env.js';
import { galat401 } from './galat.js';

const sha256 = (teks) => crypto.createHash('sha256').update(String(teks), 'utf8').digest();

/** Bandingkan sandi tanpa bocor panjang atau waktu (keduanya di-hash dulu, panjang sama). */
export function cekSandi(sandi) {
  if (typeof sandi !== 'string' || sandi.length === 0 || sandi.length > 200) return false;
  return crypto.timingSafeEqual(sha256(sandi), sha256(env.adminPassword));
}

export function buatToken() {
  return jwt.sign({ peran: 'admin' }, env.jwtSecret, {
    algorithm: 'HS256',
    expiresIn: env.jwtExpiresIn,
  });
}

/** Middleware untuk rute admin: header `Authorization: Bearer <token>`. */
export function wajibAdmin(req, res, next) {
  const header = req.headers.authorization ?? '';
  const [skema, token] = header.split(' ');
  if (skema !== 'Bearer' || !token) return next(galat401());
  try {
    const isi = jwt.verify(token, env.jwtSecret, { algorithms: ['HS256'] });
    if (isi.peran !== 'admin') return next(galat401());
    req.admin = true;
    return next();
  } catch {
    return next(galat401('Sesi berakhir. Silakan login lagi.'));
  }
}
