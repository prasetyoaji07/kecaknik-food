import { Router } from 'express';
import { env } from '../env.js';
import { batasLogin } from '../middleware/batasan.js';
import { cekSandi, buatToken } from '../middleware/auth.js';
import { galat401 } from '../middleware/galat.js';

const router = Router();

// POST /auth/login  { password }  ->  { token, kedaluwarsa }
router.post('/login', batasLogin, (req, res, next) => {
  const sandi = req.body?.password ?? req.body?.sandi;
  if (!cekSandi(sandi)) return next(galat401('Sandi salah.'));
  return res.json({ token: buatToken(), kedaluwarsa: env.jwtExpiresIn });
});

export default router;
