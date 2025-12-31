
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import pkg from 'pg';
import setUserContext from './middleware/auth.js';
import mountCaseRoutes from "./routes/cases.js";

// بعد app + pool
mountCasesRoutes(app, pool);


const { Pool } = pkg;

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// يضبط app.user_id لكل طلب ويضيف req.db
app.use(setUserContext(pool));

// صحة الاتصال
app.get('/health', async (req, res) => {
  try {
    const { rows } = await req.db.query('SELECT current_user, current_database();');
    res.json({ ok: true, db: rows[0] });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  } finally {
    req.db.release();
  }
});

// القضايا (RLS يفلتر تلقائيًا عبر app.user_id)
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
  } finally {
    req.db.release();
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`faris-smart API running on :${port}`));

