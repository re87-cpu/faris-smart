// C:\faris-smart\server\src\server.mjs
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { v4 as uuidv4 } from 'uuid';
import winston from 'winston';
import jwt from 'jsonwebtoken';
import pkg from 'pg';

import mountAuthRoutes from './routes/auth.js';     // /auth/* لا تحتاج توكن
import setUserContext from './middleware/auth.js';  // يقرأ JWT ويضبط app.user_id ويضيف req.db

const { Pool } = pkg;

/* ======================= Logger ======================= */
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({
      filename: 'logs/server.log',
      maxsize: 5 * 1024 * 1024,
      maxFiles: 5
    })
  ],
});

/* ================== إنشاء تطبيق Express أولاً ================== */
const app = express();
const port = Number(process.env.PORT || 3000);

/* ================== Middleware أساسية ================== */
app.set('trust proxy', 1);

// ===================== CORS =====================
const ORIGINS = (
  process.env.CORS_ORIGINS ||
  "http://localhost:5173,http://localhost:3000,https://www.faris-legal.com,https://faris-legal.com,https://faris-legal.onrender.com"
)
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      // يسمح لأدوات مثل curl/VSCode (بدون origin)
      if (!origin) return cb(null, true);

      // قارن بنفس النص
      if (ORIGINS.includes(origin)) return cb(null, true);

      return cb(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);
// ===============================================


// Rate limit عام
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
}));

// Request ID
app.use((req, _res, next) => {
  req.id = req.headers['x-request-id'] || uuidv4();
  next();
});

// أمان/JSON/لوج
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(express.json({ limit: '1mb' }));
app.use(morgan('tiny'));

/* ================== اتصال قاعدة البيانات ================== */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 10_000,
});

/* ======================= Health (بدون توكن) ======================= */
// ⚠️ هذا القسم يجب أن يبقى قبل app.use(setUserContext(pool))
app.get('/healthz', (_req, res) => res.status(200).json({ ok: true }));

app.get('/readyz', async (_req, res) => {
  const client = await pool.connect();
  try {
    const { rows } = await client.query('SELECT 1 AS ok;');
    res.json({ ok: rows?.[0]?.ok === 1 });
  } catch (e) {
    res.status(503).json({ ok: false, error: e.message });
  } finally {
    client.release();
  }
});

/* ================ مسارات لا تحتاج توكن ================ */
mountAuthRoutes(app, pool);

/* /me مباشر بالـJWT — تشخيص سريع وواضح (لا يعتمد على app.user_id) */
app.get('/me', async (req, res) => {
  const auth = req.headers['authorization'] || '';
  const [, token] = auth.split(' ');
  if (!token) return res.status(401).json({ error: 'unauthorized', detail: 'missing token' });

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch (e) {
    return res.status(401).json({ error: 'unauthorized', detail: e.message || 'jwt invalid' });
  }

  const client = await pool.connect();
  try {
    const { rows } = await client.query(
      `SELECT id, full_name, email, role FROM app.users WHERE id = $1`,
      [String(payload.sub)]
    );
    if (!rows.length) {
      return res.status(401).json({ error: 'no_user_in_session', detail: 'user not found for sub' });
    }
    return res.json(rows[0]);
  } catch (e) {
    return res.status(500).json({ error: 'internal_error', detail: e.message });
  } finally {
    client.release();
  }
});

/* ================ Middleware JWT لبقية الراوتات ================ */
app.use(setUserContext(pool));

/* ======================= API ======================= */
app.get('/cases', async (req, res) => {
  try {
    const { rows } = await req.db.query(`
      SELECT id, case_number, title, status, created_at
      FROM app.cases
      ORDER BY created_at DESC
      LIMIT 50;
    `);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});


app.post('/assign', async (req, res) => {
  const { case_id, user_id, assigned_by } = req.body || {};
  try {
    const isUuid = v => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);
    if (!isUuid(case_id) || !isUuid(user_id) || (assigned_by && !isUuid(assigned_by))) {
      return res.status(400).json({ error: 'invalid uuid in payload' });
    }

    const { rows } = await req.db.query(
      `INSERT INTO app.assignments (case_id, user_id, assigned_by)
       VALUES ($1, $2, COALESCE($3, app.current_user_id()))
       ON CONFLICT (case_id, user_id) DO NOTHING
       RETURNING id, case_id, user_id, assigned_by, assigned_at;`,
      [case_id, user_id, assigned_by || null],
    );

    res.status(rows.length ? 201 : 200).json(rows[0] || { ok: true, note: 'already assigned' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  } finally {
    try { req.db.release(); } catch {}
  }
});

/* =================== 404 & Errors =================== */
app.use((req, res) => res.status(404).json({ error: 'not_found', request_id: req.id }));

app.use((err, req, res, _next) => {
  logger.error('Unhandled error', { request_id: req.id, message: err.message, stack: err.stack });
  try { req?.db?.release?.(); } catch {}
  res.status(500).json({ error: 'internal_error', request_id: req.id });
});

/* =================== Shutdown =================== */
const shutdown = async (signal) => {
  console.log(`\n${signal} received. Shutting down...`);
  try { await pool.end(); } catch {}
  process.exit(0);
};
process.on('SIGINT',  () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

/* =================== Listen =================== */
app.listen(port, () => console.log(`faris-smart API running on :${port}`));
