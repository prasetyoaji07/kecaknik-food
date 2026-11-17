// BR-16, D-20: pembatasan percobaan per IP, disimpan di memori.
import rateLimit from 'express-rate-limit';

function pembatas(pesan, limit) {
  return rateLimit({
    windowMs: 60 * 1000,
    limit,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    handler: (req, res) => res.status(429).json({ error: pesan }),
  });
}

/** POST /auth/login: 10 per menit per IP. */
export const batasLogin = pembatas('Terlalu banyak percobaan login. Coba lagi sebentar lagi.', 10);

/** GET /orders/kode/:kode: 60 per menit per IP. */
export const batasLacak = pembatas('Terlalu banyak permintaan. Coba lagi sebentar lagi.', 60);
